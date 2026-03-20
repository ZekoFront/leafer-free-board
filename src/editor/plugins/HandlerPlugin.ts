import { SelectEvent, SelectMode, trackedAttrs } from "@/editor/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import { LeaferEvent, DragEvent, type IUI, Line, Path, PropertyEvent } from "leafer-ui";
import { cloneDeep, isArray, isEqual, isNull, isObject } from "lodash-es";
import type { IMoveData } from "../types";
import { EditorEvent } from "@leafer-in/editor";

const TRACKED_ATTRS = new Set(trackedAttrs);

const ATTR_DEBOUNCE_MS = 300;

class HandlerPlugin implements IPluginTempl {
    static pluginName = "HandlerPlugin";
    static apis = ["getSelectMode"];
    public selectedMode: SelectMode;
    private newSelectedElements: IUI[] = [];
    // Key: 线条ID, Value: 线条的关键属性 (points 或 path)
    private lineStartSnapshot: Map<
        string,
        { points?: number[]; path?: string }
    > = new Map();
    // Key: 标签ID, Value: 标签的起始位置
    private labelStartSnapshot: Map<string, { x: number; y: number }> =
        new Map();
    private _pendingAttrChange: {
        elementId: string;
        tag: string;
        oldAttrs: Record<string, any>;
        newAttrs: Record<string, any>;
        timer: ReturnType<typeof setTimeout>;
    } | null = null;

    constructor(public editorBoard: EditorBoard) {
        this.selectedMode = SelectMode.EMPTY;
        this._listenners();
    }
    private dragStartSnapshot: Map<string, { x: number; y: number }> =
        new Map();
    private _listenners() {
        this.editorBoard.app.sky.on(
            LeaferEvent.READY,
            this._listenSkyReadyEvent,
        );
        this.editorBoard.app.editor.on(
            EditorEvent.SELECT,
            this._listenSelectEvent,
        );
        // DragEvent拖拽事件监听
        this.editorBoard.app.on(DragEvent.START, this._listenDragStartEvent);
        this.editorBoard.app.on(DragEvent.END, this._listenDragEndEvent);
        this.editorBoard.app.on(DragEvent.MOVE, this._listenDragMoveEvent);
        this.editorBoard.app.tree.on(PropertyEvent.CHANGE, this._listenPropertyEvent);
    }

    private _unlistenners() {
        this.editorBoard.app.sky.off(
            LeaferEvent.READY,
            this._listenSkyReadyEvent,
        );
        this.editorBoard.app.editor.off(
            EditorEvent.SELECT,
            this._listenSelectEvent,
        );
        this.editorBoard.app.off(DragEvent.START, this._listenDragStartEvent);
        this.editorBoard.app.off(DragEvent.END, this._listenDragEndEvent);
        this.editorBoard.app.off(DragEvent.MOVE, this._listenDragMoveEvent);
        this.editorBoard.app.tree.off(PropertyEvent.CHANGE, this._listenPropertyEvent);
    }

    /**
     * 统一监听选中元素的属性变更，自动录入历史记录。
     *
     * 使用防抖延时器（ATTR_DEBOUNCE_MS = 300ms）合并高频连续操作：
     * - 场景：用户连续点击 n-input-number 的步进按钮（12→13→14→15），
     *   或快速输入文本（h→he→hel→hell→hello），每次都会触发 PropertyEvent。
     * - 如果不做防抖，每次变更都会生成一条独立的历史命令，
     *   用户需要按 5 次 Ctrl+Z 才能撤回一次"调大字号"操作，体验极差。
     * - 防抖策略：在 300ms 内的连续变更合并为一条命令，
     *   保留第一次变更的 oldValue（原始值）和最后一次的 newValue（最终值），
     *   用户只需一次 Ctrl+Z 即可撤回整组操作。
     */
    private _listenPropertyEvent = (evt: PropertyEvent) => {
        // 撤销/重做期间产生的 PropertyEvent 不应被重新录入
        if (this.editorBoard.history.isPerformingAction) return;

        const attrName = (evt as any).attrName as string;
        const oldValue = (evt as any).oldValue;
        const newValue = (evt as any).newValue;
        const target = evt.target as IUI;

        // 只跟踪白名单内的用户可编辑属性，忽略 Leafer 内部属性变化
        if (!attrName || !TRACKED_ATTRS.has(attrName)) return;

        const elementId = target?.id;
        if (!elementId) return;

        // 只记录当前选中元素的变更，排除画布上其他元素的属性变化
        const isSelected = this.newSelectedElements.some(el => el.id === elementId);
        if (!isSelected) return;

        const tag = (target as any)?.tag || '';

        if (this._pendingAttrChange && this._pendingAttrChange.elementId === elementId) {
            // 同一元素的后续变更：更新 newAttrs 为最新值，保留首次 oldAttrs 不变
            this._pendingAttrChange.newAttrs[attrName] = newValue;
            if (!(attrName in this._pendingAttrChange.oldAttrs)) {
                this._pendingAttrChange.oldAttrs[attrName] = oldValue;
            }
            // 重置延时器：只要持续有变更就一直延后提交，直到操作停止 300ms
            clearTimeout(this._pendingAttrChange.timer);
            this._pendingAttrChange.timer = setTimeout(
                () => this._flushPendingAttrChange(),
                ATTR_DEBOUNCE_MS,
            );
        } else {
            // 切换到新元素时，先提交上一个元素的待定变更
            this._flushPendingAttrChange();
            this._pendingAttrChange = {
                elementId,
                tag,
                oldAttrs: { [attrName]: oldValue },
                newAttrs: { [attrName]: newValue },
                // 启动延时器：300ms 内无新变更则自动提交到历史
                timer: setTimeout(
                    () => this._flushPendingAttrChange(),
                    ATTR_DEBOUNCE_MS,
                ),
            };
        }
    };

    /** 将累积的待定属性变更提交为一条 UpdateAttrCommand */
    private _flushPendingAttrChange() {
        if (!this._pendingAttrChange) return;
        const { elementId, tag, oldAttrs, newAttrs, timer } = this._pendingAttrChange;
        clearTimeout(timer);
        this._pendingAttrChange = null;

        const hasChanged = Object.keys(newAttrs).some(
            key => newAttrs[key] !== oldAttrs[key],
        );
        if (!hasChanged) return;
        this.editorBoard.history.execute({
            executeType: ExecuteTypeEnum.UpdateAttribute,
            elementId,
            oldAttrs,
            newAttrs,
            tag,
        });
    }

    private _listenDragStartEvent = (evt: DragEvent) => {
        // 单个拖拽元素触发
        if (evt.target.id) {
            this.editorBoard.onDragStartElement(evt.target);
            this.dragStartSnapshot.set(evt.target.id || "", {
                x: evt.target.x || 0,
                y: evt.target.y || 0,
            });
        }
        // 多选开始拖拽
        else if (this.newSelectedElements && this.newSelectedElements.length) {
            // 初始化起始坐标
            this.newSelectedElements.forEach((el) => {
                if (el.data) {
                    el.data.oldX = el.x;
                    el.data.oldY = el.y;
                    this.dragStartSnapshot.set(el.id || "", {
                        x: el.data.oldX || 0,
                        y: el.data.oldY || 0,
                    });
                }
            });
        }

        // 清空旧快照
        this.lineStartSnapshot.clear();
        this.labelStartSnapshot.clear();

        // 收集所有被拖拽元素关联的线条和标签
        const targets = this.newSelectedElements.length
            ? this.newSelectedElements
            : [evt.target];
        const relatedLines = new Set<IUI>();
        const relatedLabels = new Set<IUI>();

        targets.forEach((target) => {
            const lines = this.editorBoard.getShapePluginRelatedLines(target);
            lines.forEach((line: IUI) => relatedLines.add(line));
            const labels = this.editorBoard.getShapePluginRelatedLabels(target);
            labels.forEach((label: IUI) => relatedLabels.add(label));
        });

        // 记录线条初始状态
        relatedLines.forEach((line) => {
            if (line && line.id) {
                const newLine: Line = line as Line;
                this.lineStartSnapshot.set(line.id, {
                    points: cloneDeep(newLine.points) as number[],
                    path: cloneDeep(newLine.path) as string,
                });
            }
        });

        // 记录标签初始位置
        relatedLabels.forEach((label) => {
            if (label && label.id) {
                this.labelStartSnapshot.set(label.id, {
                    x: label.x || 0,
                    y: label.y || 0,
                });
            }
        });
    };

    private _listenDragMoveEvent = (evt: DragEvent) => {
        // 单个拖拽元素触发
        if (this.newSelectedElements.length === 1) {
            this.editorBoard.onDragMoveElement(evt);
        }
    };

    private _listenDragEndEvent = () => {
        this.editorBoard.onDragEndEvent();
        const moveList: IMoveData[] = [];
        if (this.newSelectedElements.length) {
            // 获取批量新坐标
            this.newSelectedElements.forEach((el) => {
                const oldPos = this.dragStartSnapshot.get(el.id || "");
                if (
                    oldPos &&
                    (Math.abs((el.x || 0) - oldPos.x) > 0.01 ||
                        Math.abs((el.y || 0) - oldPos.y) > 0.01)
                ) {
                    moveList.push({
                        id: el.id || "",
                        old: { x: oldPos.x, y: oldPos.y },
                        new: { x: el.x || 0, y: el.y || 0 },
                    });
                }
            });

            // 检查关联线条变化
            if (this.lineStartSnapshot.size > 0) {
                this.lineStartSnapshot.forEach((oldState, lineId) => {
                    const currentLine =
                        this.editorBoard.app.tree.findId(lineId);
                    if (!currentLine) return;

                    let hasChanged = false;
                    const newState: any = {};
                    const oldStateRecord: any = {};

                    // 检查 Line (points 变化)
                    if (currentLine.tag === "Line" && oldState.points) {
                        const currentPoints = (currentLine as Line).points;
                        // 简单对比数组长度或内容 (这里用 JSON.stringify 简单判断)
                        if (!isEqual(currentPoints, oldState.points)) {
                            hasChanged = true;
                            newState.points = currentPoints; // 引用当前的新 points
                            oldStateRecord.points = oldState.points; // 之前的旧 points
                        }
                    }
                    // 检查 Path (path 字符串变化)
                    else if (currentLine.tag === "Path" && oldState.path) {
                        const currentPath = (currentLine as Path).path;
                        if (currentPath !== oldState.path) {
                            hasChanged = true;
                            newState.path = currentPath;
                            oldStateRecord.path = oldState.path;
                        }
                    }

                    if (hasChanged) {
                        moveList.push({
                            id: lineId,
                            old: oldStateRecord,
                            new: newState,
                        });
                    }
                });

                // 清理快照
                this.lineStartSnapshot.clear();
            }

            // 检查关联标签位置变化
            if (this.labelStartSnapshot.size > 0) {
                this.labelStartSnapshot.forEach((oldPos, labelId) => {
                    const currentLabel =
                        this.editorBoard.app.tree.findId(labelId);
                    if (!currentLabel) return;

                    if (
                        Math.abs((currentLabel.x || 0) - oldPos.x) > 0.01 ||
                        Math.abs((currentLabel.y || 0) - oldPos.y) > 0.01
                    ) {
                        moveList.push({
                            id: labelId,
                            old: { x: oldPos.x, y: oldPos.y },
                            new: {
                                x: currentLabel.x || 0,
                                y: currentLabel.y || 0,
                            },
                        });
                    }
                });
                this.labelStartSnapshot.clear();
            }

            // 添加操作记录
            if (moveList.length > 0) {
                this.editorBoard.history.execute({
                    executeType: ExecuteTypeEnum.MoveElement,
                    moveList: moveList,
                });
            }
        }
    };

    // evt: LeaferEvent
    private _listenSkyReadyEvent = () => {
        console.log("编辑器初始化完成");
    };

    private _listenSelectEvent = (evt: EditorEvent) => {
        this._flushPendingAttrChange();
        if (isArray(evt.value)) {
            this.selectedMode = SelectMode.MULTIPLE;
            this.editorBoard.emit(SelectEvent.MULTIPLE, evt.value);
            this._setSelect(evt.value);
        } else if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE;
            this.editorBoard.emit(SelectEvent.SINGLE, evt.value);
            this._setSelect([evt.value]);
        } else if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY;
            this.editorBoard.emit(SelectEvent.EMPTY, evt.value);
        }
    };

    private _setSelect(list: IUI[] = []) {
        this.newSelectedElements = list;
        // 初始化起始坐标，每次拖拽时都有不同的旧坐标
        this.newSelectedElements.forEach((el) => {
            if (el.data) {
                el.data.oldX = el.x;
                el.data.oldY = el.y;
            }
        });
    }

    protected getSelectMode() {
        return String(this.selectedMode);
    }

    public destroy() {
        this._flushPendingAttrChange();
        this.selectedMode = SelectMode.EMPTY;
        this.newSelectedElements = [];
        this.dragStartSnapshot.clear();
        this.lineStartSnapshot.clear();
        this.labelStartSnapshot.clear();
        this._unlistenners();
    }
}

export default HandlerPlugin;
