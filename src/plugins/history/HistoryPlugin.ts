import type EditorCore from "@/core/EditorCore";
import type { IPluginTempl } from "@/core/types";
import { ChildEvent, DragEvent, KeyEvent, Line } from "leafer-ui";

// 1. 定义原子增量操作的 TS 类型体系
export type HistoryType = "ADD" | "REMOVE" | "UPDATE_BATCH";

export interface EntityProps {
    id: string;
    className: string; // 用于 REMOVE 之后，UNDO 恢复时知道实例化什么组件
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: number[]; // 连线专用的坐标数组
    fill?: string;
    stroke?: string;
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
    targetClass?: string;
    undoData?: Partial<EntityProps>;
    redoData?: Partial<EntityProps>;
}

// 2. 完整历史记录控制插件
export class HistoryPlugin implements IPluginTempl {
    static pluginName = "HistoryPlugin";
    private app: any;
    private undoStack: HistoryOp[] = [];
    private redoStack: HistoryOp[] = [];
    private maxStackSize = 100; // 限制栈深度防止内存溢出

    // 状态锁：当处于 撤销/重做 执行期时，不重复收集变更
    private isExecuting = false;
    // 临时暂存器：用于在拖拽刚开始时备份图元状态
    private snapshotBeforeDrag: Map<string, Partial<EntityProps>> = new Map();

    constructor(public editor: EditorCore) {
        this.app = editor.app;
        this.listen();
    }
    pluginName = HistoryPlugin.pluginName;
    events?: string[] | undefined;
    apis?: string[] | undefined;
    hotkeys?: string[] | undefined;
    hotkeyEvent?: ((name: string, e: KeyboardEvent) => void) | undefined;

    // ==========================================
    // 一、官方事件流的高性能拦截
    // ==========================================
    private listen() {
        // 拖拽需监听 app 层（editor 层首次拖拽可能不触发，见 leaferjs配置注意事项.md）
        this.app.on(DragEvent.START, this.onDragStart);
        this.app.on(DragEvent.END, this.onDragEnd);

        // Leafer 原生子元素增删：ChildEvent.ADD / REMOVE（不是字符串 "add"）
        this.app.tree.on(ChildEvent.ADD, this.onAddUnified);
        this.app.tree.on(ChildEvent.REMOVE, this.onRemoveUnified);
        // 自定义批量更新事件（onDragEnd 内 emit）
        this.app.tree.on("update", this.onUpdateUnified);

        this.app.on(KeyEvent.DOWN, this.onKeydown);
    }

    private onDragStart = () => {
        if (this.isExecuting) return;
        this.snapshotBeforeDrag.clear();

        const targets = this.app.editor.targets || [];
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
            const currentTarget = this.app.tree.findId(id);
            if (!currentTarget) return;

            // 精准对比关键几何属性及连线点位是否真正发生突变
            const hasChanged =
                currentTarget.x !== oldProps.x ||
                currentTarget.y !== oldProps.y ||
                JSON.stringify(currentTarget.points) !==
                    JSON.stringify(oldProps.points);

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
            targetClass: child.tag || "Rect",
            redoData: this.extractCurrentProps(child),
        });
    };

    private onRemoveUnified = (e: ChildEvent) => {
        const child = e.child;
        if (this.isExecuting || !child?.id) return;
        this.pushOp({
            type: "REMOVE",
            targetId: child.id,
            targetClass: child.tag || "Rect",
            undoData: this.extractCurrentProps(child),
        });
    };

    private onUpdateUnified = (e: any) => {
        if (this.isExecuting || !e.batch) return;
        this.pushOp({
            type: "UPDATE_BATCH",
            batchData: e.batch,
        });
    };

    private onKeydown = (e: any) => {
        // 自动捕获键盘快捷键快捷撤销重做
        const isCtrl = e.ctrlKey || e.metaKey;
        if (isCtrl && e.code === "KeyZ") {
            e.preventDefault();
            this.undo();
        } else if (isCtrl && e.code === "KeyY") {
            e.preventDefault();
            this.redo();
        }
    };

    // ==========================================
    // 二、核心撤销（Undo）与重做（Redo）核心逻辑
    // ==========================================

    /**
     * 压入历史栈底
     */
    private pushOp(op: HistoryOp) {
        this.undoStack.push(op);
        this.redoStack = []; // 产生新操作时，必须切断重做链
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }

    /**
     * 执行撤销
     */
    public undo() {
        if (this.isExecuting) return;
        const op = this.undoStack.pop();
        if (!op) return;

        this.isExecuting = true; // 开启状态锁
        this.redoStack.push(op);

        this.applyOperation(op, "undo");
        this.isExecuting = false; // 释放状态锁
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
                    this.rawCreate(op.targetClass!, op.redoData!);
                }
                break;

            case "REMOVE":
                // REMOVE 的撤销是重新恢复图元，重做是再次移除
                if (isUndo) {
                    this.rawCreate(op.targetClass!, op.undoData!);
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
        }
    }

    // ==========================================
    // 三、底层画布实体组装与映射（工具函数）
    // ==========================================

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
            className: target.tag || target.className,
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            fill: target.fill,
            stroke: target.stroke,
        };
        // 特殊处理连线的路径点点位
        if (target.points) {
            props.points = [...target.points];
        }
        // 恢复连线与节点之间的关联拓扑关系核心
        if (target.customData) {
            props.customData = { ...target.customData };
        }
        return props;
    }

    /**
     * 顺藤摸瓜：根据节点 ID 获取与其连接的所有连线图元
     */
    private getRelatedLines(nodeId: string): any[] {
        const allLines = this.app.tree.find({ className: "Line" }) || [];
        return allLines.filter(
            (line: any) =>
                line.customData?.startNodeId === nodeId ||
                line.customData?.endNodeId === nodeId,
        );
    }

    /**
     * 纯物理还原图元方法
     */
    private rawCreate(className: string, props: Partial<EntityProps>) {
        let element: any;
        // 根据类别反射创建 Leafer 图元实例
        if (className === "Line") {
            element = new Line(props as any);
        } else {
            // 默认按基础图元或通过你的自定义注册类来实例化
            //   const LeaferUI = require('leafer-ui')
            //   if (LeaferUI[className]) {
            //     element = new LeaferUI[className](props)
            //   }
        }

        if (element) {
            this.app.tree.add(element);
        }
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

    // ==========================================
    // 四、外部纯 TS / Vue 业务层通用交互 API
    // ==========================================

    public getCanUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public getCanRedo(): boolean {
        return this.redoStack.length > 0;
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
        this.app.off(KeyEvent.DOWN, this.onKeydown);
        this.snapshotBeforeDrag.clear();
        this.undoStack = [];
        this.redoStack = [];
    }
}
