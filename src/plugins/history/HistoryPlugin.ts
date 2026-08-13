import type EditorCore from "@/core/EditorCore";
import { CustomEvent, HOTKEY_TYPE } from "@/core/constants";
import type { IPluginTempl } from "@/core/types";
import { App, ChildEvent, DragEvent, Text, type IUI } from "leafer-ui";
import { InnerEditorEvent } from "@leafer-in/editor";

// 1. 定义原子增量操作的 TS 类型体系
export type HistoryType = "ADD" | "REMOVE" | "UPDATE_BATCH" | "STRUCTURE";

export interface EntityProps {
    id: string;
    className: string; // 用于 REMOVE 之后，UNDO 恢复时知道实例化什么组件
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    points?: number[]; // 连线专用的坐标数组
    path?: string; // Path 连线
    fill?: string;
    stroke?: string;
    text?: string | number;
    customData?: Record<string, any>; // 保存节点和线之间的关联关系
}

export interface HistoryOp {
    type: HistoryType;
    // 针对 BATCH 更新：单次操作影响的多个图元(如一个节点及其4条相连线)
    batchData?: {
        id: string;
        undoData: Partial<EntityProps>;
        redoData: Partial<EntityProps>;
    }[];
    // 针对 单图元 ADD/REMOVE
    targetId?: string;
    targetTag?: string;
    undoData?: Partial<EntityProps>;
    redoData?: Partial<EntityProps>;
    /** 编组/解组等结构变更：变更前后的完整子树 JSON */
    structureUndo?: Record<string, any>[];
    structureRedo?: Record<string, any>[];
}

export interface HistoryStateSnapshot {
    undoStack: HistoryOp[];
    redoStack: HistoryOp[];
}

// 2. 完整历史记录控制插件
export class HistoryPlugin implements IPluginTempl {
    static pluginName = "HistoryPlugin";
    static apis = [
        "undo",
        "redo",
        "getCanUndo",
        "getCanRedo",
        "clearHistory",
        "exportHistory",
        "importHistory",
        "runWithoutRecording",
        "getIsExecuting",
        "groupSelection",
        "ungroupSelection",
    ];
    private app: App;
    private undoStack: HistoryOp[] = [];
    private redoStack: HistoryOp[] = [];
    private maxStackSize = 50; // 限制栈深度防止内存溢出

    // 状态锁：当处于 撤销/重做 执行期时，不重复收集变更
    private isExecuting = false;
    // 临时暂存器：用于在拖拽刚开始时备份图元状态
    private snapshotBeforeDrag: Map<string, Partial<EntityProps>> = new Map();
    // 内联文本编辑：OPEN 时备份，CLOSE 时对比并入栈
    private innerEditorTextSnapshot: { targetId: string; text: string } | null =
        null;

    constructor(public editor: EditorCore) {
        this.app = editor.app;
        this.listen();
    }
    pluginName = HistoryPlugin.pluginName;
    events?: string[] | undefined;
    apis?: string[] | undefined;
    hotkeys = [HOTKEY_TYPE.UNDO, HOTKEY_TYPE.REDO];

    private listen() {
        // 拖拽需监听 app 层（editor 层首次拖拽可能不触发，见 leaferjs配置注意事项.md）
        this.app.on(DragEvent.START, this.onDragStart);
        this.app.on(DragEvent.END, this.onDragEnd);

        // Leafer 原生子元素增删：ChildEvent.ADD / REMOVE（不是字符串 "add"）
        this.app.tree.on(ChildEvent.ADD, this.onAddUnified);
        this.app.tree.on(ChildEvent.REMOVE, this.onRemoveUnified);
        // 自定义批量更新事件（onDragEnd 内 emit）
        this.app.tree.on("update", this.onUpdateUnified);

        this.app.editor.on(InnerEditorEvent.OPEN, this.onOpenInnerEditor);
        this.app.editor.on(InnerEditorEvent.CLOSE, this.onCloseInnerEditor);
    }

    private onDragStart = () => {
        if (this.isExecuting) return;
        this.snapshotBeforeDrag.clear();
        // 获取选中的元素
        const targets = this.app.editor.list || [];
        targets.forEach((target: any) => {
            // 1. 备份节点自身状态
            this.storeTargetSnapshot(target);
            // 2. 顺藤摸瓜：找出与该节点产生拓扑关联的所有连线，一起备份
            const relatedLines = this.getRelatedLines(target.id);
            relatedLines.forEach((line) => this.storeTargetSnapshot(line));
        });
    };

    private onDragEnd = () => {
        if (this.isExecuting || this.snapshotBeforeDrag.size === 0) return;

        const updateBatch: HistoryOp["batchData"] = [];

        this.snapshotBeforeDrag.forEach((oldProps, id) => {
            const currentTarget: any = this.app.tree.findId(id);
            if (!currentTarget) return;

            // 精准对比关键几何属性及连线点位是否真正发生突变
            const hasChanged =
                currentTarget.x !== oldProps.x ||
                currentTarget.y !== oldProps.y ||
                currentTarget.rotation !== oldProps.rotation ||
                JSON.stringify(currentTarget.points) !==
                    JSON.stringify(oldProps.points) ||
                currentTarget.path !== oldProps.path;

            if (hasChanged) {
                updateBatch.push({
                    id,
                    undoData: { ...oldProps },
                    redoData: this.extractCurrentProps(currentTarget),
                });
            }
        });

        // 只有当数据真正发生改变时，才向下游发布更新
        if (updateBatch.length > 0) {
            this.app.tree.emit("update", { batch: updateBatch });
        }

        this.snapshotBeforeDrag.clear();
    };

    private onAddUnified = (e: ChildEvent) => {
        const child = e.child;
        if (this.isExecuting || !child?.id || child === this.app.tree) return;
        this.pushOp({
            type: "ADD",
            targetId: child.id,
            targetTag: child.tag,
            redoData: child.toJSON(),
        });
    };

    private onRemoveUnified = (e: ChildEvent) => {
        const child = e.child;
        if (this.isExecuting || !child?.id) return;
        this.pushOp({
            type: "REMOVE",
            targetId: child.id,
            targetTag: child.tag,
            undoData: child.toJSON(),
        });
    };

    private onUpdateUnified = (e: any) => {
        if (this.isExecuting || !e.batch) return;
        this.pushOp({
            type: "UPDATE_BATCH",
            batchData: e.batch,
        });
    };

    hotkeyEvent = (eventName: string, e: KeyboardEvent) => {
        e.preventDefault();
        if (e.type !== "keyup") return;

        if (eventName === HOTKEY_TYPE.UNDO) {
            this.undo();
        } else if (eventName === HOTKEY_TYPE.REDO) {
            this.redo();
        }
    };

    private onOpenInnerEditor = () => {
        if (this.isExecuting) return;

        const editTarget = this.app.editor.innerEditor?.editTarget;
        if (!(editTarget instanceof Text) || !editTarget.id) return;

        this.innerEditorTextSnapshot = {
            targetId: editTarget.id,
            text: String(editTarget.text ?? ""),
        };
    };

    private onCloseInnerEditor = () => {
        if (this.isExecuting) return;

        const snapshot = this.innerEditorTextSnapshot;
        if (!snapshot) return;

        const editTarget =
            this.app.editor.innerEditor?.editTarget ??
            this.app.tree.findId(snapshot.targetId);

        this.innerEditorTextSnapshot = null;

        if (
            !(editTarget instanceof Text) ||
            editTarget.id !== snapshot.targetId
        ) {
            return;
        }

        const currentText = String(editTarget.text ?? "");
        if (currentText === snapshot.text) return;

        this.pushOp({
            type: "UPDATE_BATCH",
            batchData: [
                {
                    id: snapshot.targetId,
                    undoData: { text: snapshot.text },
                    redoData: { text: currentText },
                },
            ],
        });
    };

    /**
     * 压入历史栈底
     */
    private pushOp(op: HistoryOp) {
        this.undoStack.push(op);
        this.redoStack = []; // 产生新操作时，必须切断重做链
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.emitChange();
    }

    /**
     * 执行撤销
     */
    public undo() {
        if (this.isExecuting) return;
        this.app.editor.cancel();
        const op = this.undoStack.pop();
        if (!op) return;

        this.isExecuting = true; // 开启状态锁
        this.redoStack.push(op);

        this.applyOperation(op, "undo");
        this.isExecuting = false; // 释放状态锁
        this.emitChange();
    }

    /**
     * 执行重做
     */
    public redo() {
        if (this.isExecuting) return;
        const op = this.redoStack.pop();
        if (!op) return;

        this.isExecuting = true; // 开启状态锁
        this.undoStack.push(op);
        this.applyOperation(op, "redo");
        this.isExecuting = false; // 释放状态锁
        this.emitChange();
    }

    /**
     * 增量原子行为分发器
     */
    private applyOperation(op: HistoryOp, mode: "undo" | "redo") {
        const isUndo = mode === "undo";

        switch (op.type) {
            case "ADD":
                // ADD 的撤销是移除，重做是重新创建
                if (isUndo) {
                    this.rawRemove(op.targetId!);
                } else {
                    this.app.tree.add(op.redoData as IUI);
                }
                break;

            case "REMOVE":
                // REMOVE 的撤销是重新恢复图元，重做是再次移除
                if (isUndo) {
                    this.app.tree.add(op.undoData as IUI);
                } else {
                    this.rawRemove(op.targetId!);
                }
                break;

            case "UPDATE_BATCH":
                // 多元素/多连线 高频批量回滚的核心
                if (op.batchData) {
                    op.batchData.forEach((item) => {
                        const target = this.app.tree.findId(item.id);
                        if (target) {
                            const dataToApply = isUndo
                                ? item.undoData
                                : item.redoData;
                            // 借助 Leafer 内置原生的拦截器批量赋值属性，性能极高
                            Object.assign(target, dataToApply);
                        }
                    });
                }
                break;

            case "STRUCTURE":
                // 编组/解组：整体替换子树，避免逐个 ADD/REMOVE 造成坐标系错乱
                if (op.structureUndo && op.structureRedo) {
                    this.applyStructure(
                        op.structureUndo,
                        op.structureRedo,
                        isUndo,
                    );
                }
                break;
        }
    }

    private storeTargetSnapshot(target: any) {
        if (!target || !target.id) return;
        this.snapshotBeforeDrag.set(
            target.id,
            this.extractCurrentProps(target),
        );
    }

    /**
     * 极简属性萃取器：只提炼与业务表现、位置相关的属性，避免序列化 Leafer 内部底层对象
     */
    private extractCurrentProps(target: any): Partial<EntityProps> {
        const props: Partial<EntityProps> = {
            id: target.id,
            className: target.tag,
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            rotation: target.rotation,
            fill: target.fill,
            stroke: target.stroke,
        };
        // 特殊处理连线的路径点点位
        if (target.points) {
            props.points = [...target.points];
        }
        if (target.path) {
            props.path = target.path;
        }
        // 恢复连线与节点之间的关联拓扑关系核心
        if (target.customData) {
            props.customData = { ...target.customData };
        }
        if (target.text !== undefined && target.text !== null) {
            props.text = target.text;
        }
        return props;
    }

    /**
     * 顺藤摸瓜：根据节点 ID 获取与其连接的所有连线图元。
     * 委托 ConnectionPlugin 拓扑表（替代旧版 customData 方案）。
     */
    private getRelatedLines(nodeId: string): any[] {
        return this.editor.getRelatedLines?.(nodeId) ?? [];
    }

    /**
     * 纯物理移除图元方法
     */
    private rawRemove(id: string) {
        const target = this.app.tree.findId(id);
        if (target) {
            target.remove();
        }
    }

    public getCanUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public getCanRedo(): boolean {
        return this.redoStack.length > 0;
    }

    public getIsExecuting(): boolean {
        return this.isExecuting;
    }

    public clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        this.emitChange();
    }

    /** 导出 undo/redo 栈，供 IndexedDB 持久化 */
    public exportHistory(): HistoryStateSnapshot {
        return {
            undoStack: JSON.parse(
                JSON.stringify(this.undoStack),
            ) as HistoryOp[],
            redoStack: JSON.parse(
                JSON.stringify(this.redoStack),
            ) as HistoryOp[],
        };
    }

    /** 从持久化数据恢复 undo/redo 栈 */
    public importHistory(state: HistoryStateSnapshot) {
        this.undoStack = JSON.parse(
            JSON.stringify(state.undoStack ?? []),
        ) as HistoryOp[];
        this.redoStack = JSON.parse(
            JSON.stringify(state.redoStack ?? []),
        ) as HistoryOp[];
        this.emitChange();
    }

    /** 加载画布或批量清空时暂停历史收集 */
    public runWithoutRecording(fn: () => void) {
        this.isExecuting = true;
        try {
            fn();
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * 编组：以单条 STRUCTURE 记录入栈。
     * 直接用 Leafer 原生 group() 会连续触发多次 ADD/REMOVE，
     * 撤销时逐条回放会在「世界坐标 ↔ 组内相对坐标」间错位。
     */
    public groupSelection() {
        const before = this.snapshotSelection();
        if (before.length < 2) return;

        this.runWithoutRecording(() => {
            // Leafer 默认创建的 Group 不带 id，会让历史、图层、解组全部失效
            this.app.editor.group?.({
                id: this.editor.generateId(),
                name: "编组",
            });
        });

        this.commitStructure(before);
    }

    /** 解组：同 groupSelection，用完整子树 JSON 还原层级与坐标 */
    public ungroupSelection() {
        const before = this.snapshotSelection();
        if (before.length === 0) return;
        if (!before.every((json) => json.tag === "Group")) return;

        this.runWithoutRecording(() => {
            this.app.editor.ungroup?.();
        });

        this.commitStructure(before);
    }

    /** 快照当前选中项的完整子树（排除连线与连线标签） */
    private snapshotSelection(): Record<string, any>[] {
        const list = (this.app.editor.list || []) as IUI[];
        return list
            .filter(
                (node) =>
                    !this.editor.isConnectionLine?.(node) &&
                    !this.editor.isConnectionLabel?.(node),
            )
            .map((node) => {
                // 兼容旧数据：无 id 的节点无法被 findId 定位，此处补齐
                if (!node.id) node.id = this.editor.generateId();
                return this.cloneJson(node);
            });
    }

    private commitStructure(before: Record<string, any>[]) {
        const after = this.snapshotSelection();
        if (after.length === 0) return;

        const sameIds =
            before.length === after.length &&
            before.every((json, i) => json.id === after[i]?.id);
        if (sameIds) return;

        this.pushOp({
            type: "STRUCTURE",
            structureUndo: before,
            structureRedo: after,
        });
    }

    private applyStructure(
        undoTree: Record<string, any>[],
        redoTree: Record<string, any>[],
        isUndo: boolean,
    ) {
        const toRemove = isUndo ? redoTree : undoTree;
        const toAdd = isUndo ? undoTree : redoTree;

        toRemove.forEach((json) => {
            if (typeof json.id === "string") this.rawRemove(json.id);
        });
        toAdd.forEach((json) => this.app.tree.add(this.cloneJson(json)));

        this.editor.rebuildConnectionsFromCanvas?.();
    }

    private cloneJson(source: any): Record<string, any> {
        return JSON.parse(JSON.stringify(source?.toJSON?.() ?? source));
    }

    private emitChange() {
        this.editor.emit(CustomEvent.CHANGE, {
            canUndo: this.getCanUndo(),
            canRedo: this.getCanRedo(),
        });
    }

    /**
     * 销毁清理事件
     */
    public destroy() {
        this.app.off(DragEvent.START, this.onDragStart);
        this.app.off(DragEvent.END, this.onDragEnd);
        this.app.tree.off(ChildEvent.ADD, this.onAddUnified);
        this.app.tree.off(ChildEvent.REMOVE, this.onRemoveUnified);
        this.app.tree.off("update", this.onUpdateUnified);
        this.app.editor.off(InnerEditorEvent.OPEN, this.onOpenInnerEditor);
        this.app.editor.off(InnerEditorEvent.CLOSE, this.onCloseInnerEditor);
        this.snapshotBeforeDrag.clear();
        this.innerEditorTextSnapshot = null;
        this.undoStack = [];
        this.redoStack = [];
    }
}
