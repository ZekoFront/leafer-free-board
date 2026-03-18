import {
    Line,
    Path,
    Text,
    PointerEvent,
    type IPointData,
    type IUI,
    type IUIInputData,
} from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import { throttle } from "lodash-es";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IDrawState, type IPluginTempl, type ISerializedConnection } from "../types";
import {
    toolbars,
    createElement,
    getBezierPathString,
    getBestConnectionByWorldBoxBounds,
    getLineMidpoint,
    getBezierMidpoint,
    enforceMinGap,
    HistoryEvent,
} from "../utils";
import { EditorRotateEvent, EditorScaleEvent } from "@leafer-in/editor";

interface IConnection {
    from: IUIInputData;
    to: IUIInputData;
    line: IUI;
    label: IUI | null;
}

const MIN_LABEL_GAP = 50;

export class ShapePlugin implements IPluginTempl {
    static pluginName = "ShapePlugin";
    static apis = [
        "setToolbarActive",
        "onDragMoveElement",
        "onDragStartElement",
        "onDragEndEvent",
        "getShapePluginRelatedLines",
        "getShapePluginRelatedLabels",
        "getSerializableConnections",
        "restoreConnections",
        "updateConnectionLabel",
    ];
    static hotkeys: string[] = [];
    static events = ["testEvent"];
    public toolbars = toolbars;
    private drawMode = "";
    private excludeTypes = ["select", "arrow"];
    private element: IUIInputData | null = null;
    private points: IPointData[] = [];
    private dragHandlers: Map<string, (e: DragEvent) => void> = new Map();
    private isDrawing = false;
    private draggingNode: IUIInputData | null = null;
    // 处理拖拽生成图形
    private leafer: HTMLDivElement | undefined;
    public startRect: IUIInputData | null = null;
    private connections: IConnection[] = [];
    // 初始化一个空函数作为默认值
    private callBack: (state: IDrawState) => void = () => {};
    constructor(public editorBoard: EditorBoard) {
        this._listenners();
    }

    protected setToolbarActive(
        type: string,
        callBack: (state?: IDrawState) => void,
    ) {
        this.drawMode = type;
        this.editorBoard.cancelSelected();
        // 需要手动拖拽绘制的图形
        if (["arrow", "line", "curve"].includes(type)) {
            this.editorBoard.app.cursor = "crosshair";
            this.editorBoard.app.editor.config.selector = false;
        } else {
            this.editorBoard.app.cursor = "pointer";
            this.editorBoard.app.editor.config.selector = true;
        }
        this.callBack = callBack;
    }

    private _listenners() {
        this.toolbars.forEach((item) => {
            // 这里的逻辑取决于 _onDragElementListener 内部实现
            // 如果内部也是 addEventListener，也需要确保引用一致
            if (!this.excludeTypes.includes(item.type))
                this._onDragElementListener(item.type);
        });

        this.leafer = document.getElementById("leafer") as HTMLDivElement;

        // 2. 传入函数引用，而不是匿名包装函数
        if (this.leafer) {
            this.leafer.addEventListener("dragover", this._onDragLeaferOver);
            this.leafer.addEventListener("drop", this._onDropLeafer);
        }

        // 指针事件监听
        // 直接传入 this._onDownPointer 引用
        this.editorBoard.app.on(PointerEvent.DOWN, this._onDownPointer);
        this.editorBoard.app.on(PointerEvent.MOVE, this._onMovePointer);
        this.editorBoard.app.on(PointerEvent.UP, this._onUpPointer);
        this.editorBoard.app.editor.on(
            EditorScaleEvent.SCALE,
            this._onTransformEvent,
        );
        this.editorBoard.app.editor.on(
            EditorRotateEvent.ROTATE,
            this._onTransformEvent,
        );
        this.editorBoard.on(HistoryEvent.CHANGE, this._onHistoryChange);
    }

    private _onDragLeaferOver = (evt: DragEvent) => {
        evt.preventDefault();
    };

    private _unListenners() {
        this.toolbars.forEach((item) => {
            if (!this.excludeTypes.includes(item.type))
                this._onDragElementRemoveListener(item.type);
        });

        // 3. 移除时传入完全相同的引用
        if (this.leafer) {
            this.leafer.removeEventListener("dragover", this._onDragLeaferOver);
            this.leafer.removeEventListener("drop", this._onDropLeafer);
        }

        this.editorBoard.app.off(PointerEvent.DOWN, this._onDownPointer);
        this.editorBoard.app.off(PointerEvent.MOVE, this._onMovePointer);
        this.editorBoard.app.off(PointerEvent.UP, this._onUpPointer);
        this.editorBoard.app.editor.off(
            EditorScaleEvent.SCALE,
            this._onTransformEvent,
        );
        this.editorBoard.app.editor.off(
            EditorRotateEvent.ROTATE,
            this._onTransformEvent,
        );
        this.editorBoard.off(HistoryEvent.CHANGE, this._onHistoryChange);
    }

    // 创建节流版本的更新函数
    private _updateRelatedLinesThrottled = throttle(
        (target: IUIInputData[]) => {
            if (target.length === 0) return;
            target.forEach((item) => {
                this._updateRelatedLines(item);
            });
        },
        16,
        { leading: true, trailing: true },
    );

    // 当元素发生缩放或旋转时触发
    private _onTransformEvent = () => {
        // 获取当前编辑器选中的所有元素列表
        this._updateRelatedLinesThrottled(this.editorBoard.app.editor.list);
    };

    private _isConnectionLabel(el: any): boolean {
        return !!el?.data?.isConnectionLabel;
    }

    private _tempElement(evt: PointerEvent) {
        // 绘制连线，允许有id的元素进行连线（排除连接标签）
        if (evt.target && evt.target.id && !this._isConnectionLabel(evt.target)) {
            this.startRect = evt.target as IUIInputData;
            this.startRect.x;
            const centerPoint: IPointData = {
                x: (this.startRect.x || 0) + (this.startRect.width || 0) / 2,
                y: (this.startRect.y || 0) + (this.startRect.height || 0) / 2,
            };
            this.points.push(centerPoint);
            this.element = new Line({
                id: this.editorBoard.generateId(),
                stroke: "#555",
                strokeWidth: 2,
                dashPattern: [4, 4],
                points: [centerPoint.x, centerPoint.y, evt.x, evt.y],
                hittable: false, // 让这条线无法被点击/拾取
            });
        }
    }

    private _onDownPointer = (evt: PointerEvent) => {
        if (
            this.editorBoard.app.editor &&
            this.editorBoard.app.cursor === "crosshair"
        ) {
            this.editorBoard.app.editor.target = undefined;
            evt.target.draggable = false;
            // 绘制箭头
            if (this.drawMode == "arrow") {
                // 按下鼠标拖动开始画线，抬起结束，当缩放平移视图后，仍然可以准确绘制新的线条
                // 转换事件为 page 坐标 = evt.getPagePoint()
                // @see https://www.leaferjs.com/ui/guide/advanced/coordinate.html
                const startPoint = evt.getPagePoint();
                this.points.push(startPoint);
                this.element = createElement(
                    "arrow",
                    startPoint,
                ) as unknown as IUI;
            }
            // 绘制直线
            else if (this.drawMode == "line") {
                this._tempElement(evt);
            }
            // 绘制曲线
            else if (this.drawMode == "curve") {
                this._tempElement(evt);
            }
        }
    };
    private _onMovePointer = (_evt: PointerEvent) => {
        if (!this.element) return;
        if (this.editorBoard.app && !this.isDrawing) {
            this.editorBoard.addLeaferElement(this.element);
            // 进入绘制状态
            this.isDrawing = true;
        }
        const endPoint = _evt.getPagePoint();
        // 绘制箭头
        if (this.drawMode == "arrow") {
            const arrow = this.element as Arrow;
            if (this.points[0]) {
                arrow.points = [
                    this.points[0].x,
                    this.points[0].y,
                    endPoint.x,
                    endPoint.y,
                ];
            }
        }
        // 绘制临时连线
        else if (["line", "curve"].includes(this.drawMode) && this.element) {
            const line = this.element as Line;
            if (this.points[0]) {
                line.points = [
                    this.points[0].x,
                    this.points[0].y,
                    endPoint.x,
                    endPoint.y,
                ];
            }
        }
    };
    private _onUpPointer = (_evt: PointerEvent) => {
        this.editorBoard.app.editor.config.selector = true;
        this.editorBoard.app.cursor = "default";

        // 绘制最终线段，替换虚线
        if (["line", "curve"].includes(this.drawMode) && this.startRect) {
            const dropResult = this.editorBoard.app.tree.pick({
                x: _evt.x,
                y: _evt.y,
            });
            let endRect = dropResult.target;
            // 排除连接标签作为连线目标
            if (endRect && this._isConnectionLabel(endRect as IUIInputData)) {
                endRect = null as any;
            }
            if (endRect) {
                // 兼容分组元素连线
                const group = endRect.parent;
                if (group?.tag === "Group" && group !== this.startRect) {
                    this._createConnection(
                        this.startRect,
                        group as IUIInputData,
                    );
                } else if (endRect !== this.startRect) {
                    this._createConnection(
                        this.startRect,
                        endRect as IUIInputData,
                    );
                }
            }

            // 删除辅助线
            this.element && this.element.remove();
        }

        // 绘制普通箭头元素
        else if (
            this.drawMode == "arrow" &&
            this.element &&
            this.element.data
        ) {
            this.editorBoard.history.execute({ executeType: ExecuteTypeEnum.AddElement, element: this.element });
        }

        this.element = null;
        this.startRect = null;
        this.isDrawing = false;
        this.points = [];
        this.callBack({ type: this.drawMode, state: "success" });
        this.drawMode = "";
    };

    private _onDragElementListener(type: string) {
        const element = document.getElementById(type);
        if (!element) return;

        const handler = (e: DragEvent) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData("type", type);
            }
        };

        this.dragHandlers.set(type, handler);
        element.addEventListener("dragstart", handler);
    }

    private _onDragElementRemoveListener = (type: string) => {
        const element = document.getElementById(type);
        const handler = this.dragHandlers.get(type);

        if (element && handler) {
            element.removeEventListener("dragstart", handler);
            this.dragHandlers.delete(type);
        }
    };

    private _onDropLeafer = (e: DragEvent) => {
        if (e.dataTransfer) {
            const type = e.dataTransfer.getData("type");
            // 如果没有指定类型则不能创建图形
            if (!type) return;

            // 浏览器原生事件的 client 坐标 转 应用的 page 坐标
            const point = this.editorBoard.app.getPagePointByClient(e);
            // 根据拖拽类型生成图形
            const shape = createElement(type, point);
            if (shape) {
                const res = this.editorBoard.addLeaferElement(shape);
                res && this.editorBoard.history.execute({ executeType: ExecuteTypeEnum.AddElement, element: shape });
            }
        }

        e.preventDefault();
    };

    private _createConnection(
        startRect: IUIInputData | null,
        endRect: IUIInputData,
    ) {
        let { p0, p3 } = getBestConnectionByWorldBoxBounds(
            startRect || ({} as IUIInputData),
            endRect,
            this.editorBoard.app,
        );

        // 保留标签最小间距
        ({ p0, p3 } = enforceMinGap(p0, p3, MIN_LABEL_GAP));

        let line: IUI | null = null;
        if (this.drawMode == "curve") {
            const pathData = getBezierPathString(p0, p3);
            line = new Path({
                path: pathData,
                stroke: "#555",
                strokeWidth: 2,
                editable: true,
                draggable: false,
                endArrow: 'arrow',
            });
        } else if (this.drawMode == "line") {
            line = new Line({
                editable: true,
                stroke: "#555",
                strokeWidth: 2,
                dashPattern: [0, 0],
                points: [p0.x, p0.y, p3.x, p3.y],
                draggable: false,
                endArrow: "arrow",
            });
        }

        if (line) {
            this.editorBoard.addLeaferElement(line);
            this.editorBoard.history.execute({ executeType: ExecuteTypeEnum.AddElement, element: line });

            const isCurve = this.drawMode === "curve";
            const mid = isCurve ? getBezierMidpoint(p0, p3) : getLineMidpoint(p0, p3);
            const label = this._createLabel(mid.x, mid.y);
            this.editorBoard.addLeaferElement(label);

            this.connections.push({
                from: startRect as IUIInputData,
                to: endRect,
                line: line,
                label: label,
            });
        }
    }

    private _createLabel(midX: number, midY: number): IUI {
        return new Text({
            id: this.editorBoard.generateId(),
            name: "ConnectionLabel",
            text: "",
            placeholder: "",
            fontSize: 12,
            editable: true,
            draggable: false,
            textAlign: "center",
            verticalAlign: "middle",
            around: "center",
            x: midX,
            y: midY,
            width: 40,
            height: 20,
            padding: [2, 6],
            boxStyle: {
                fill: "transparent",
                stroke: "transparent",
                strokeWidth: 1,
                cornerRadius: 4,
            },
            data: { isConnectionLabel: true },
        }) as unknown as IUI;
    }

    private _updateLabelPosition(label: IUI, midX: number, midY: number) {
        label.x = midX;
        label.y = midY;
    }

    // 拖拽开始选中元素
    public onDragStartElement(ele: IUIInputData) {
        this.draggingNode = ele;
    }

    // 拖拽移动更新相关连接线
    public onDragMoveElement() {
        // 绘制模式下不触发更新
        if (this.drawMode || !this.draggingNode) return;
        if (this.connections.length === 0) return;
        this._updateRelatedLinesThrottled([this.draggingNode]);
    }

    public onDragEndEvent() {
        this.draggingNode = null;
    }

    private _updateRelatedLines(movingRect: IUIInputData) {
        const movingId = movingRect.id;
        this.connections.forEach((conn) => {
            if (conn.from?.id === movingId || conn.to?.id === movingId) {
                let { p0, p3 } = getBestConnectionByWorldBoxBounds(
                    conn.from,
                    conn.to,
                    this.editorBoard.app,
                );

                if (conn.label) {
                    ({ p0, p3 } = enforceMinGap(p0, p3, MIN_LABEL_GAP));
                }

                const isCurve = conn.line.tag === "Path";
                if (isCurve) {
                    conn.line.path = getBezierPathString(p0, p3);
                } else if (conn.line.tag === "Line") {
                    (conn.line as Line).points = [p0.x, p0.y, p3.x, p3.y];
                }

                if (conn.label) {
                    const mid = isCurve
                        ? getBezierMidpoint(p0, p3)
                        : getLineMidpoint(p0, p3);
                    this._updateLabelPosition(conn.label, mid.x, mid.y);
                }
            }
        });
    }

    // 暴露给 HandlerPlugin 使用，获取某个元素关联的所有线条
    public getShapePluginRelatedLines(node: IUIInputData): IUI[] {
        const nodeId = node.id;
        return this.connections
            .filter((conn) => conn.from?.id === nodeId || conn.to?.id === nodeId)
            .map((conn) => conn.line as IUI);
    }

    // 暴露给 HandlerPlugin 使用，获取某个元素关联的所有标签
    public getShapePluginRelatedLabels(node: IUIInputData): IUI[] {
        const nodeId = node.id;
        return this.connections
            .filter((conn) => conn.from?.id === nodeId || conn.to?.id === nodeId)
            .filter((conn) => conn.label !== null)
            .map((conn) => conn.label as IUI);
    }

    /** 通过线段 id 更新对应标签文字 */
    public updateConnectionLabel(lineId: string, text: string) {
        const conn = this.connections.find((c) => c.line?.id === lineId);
        if (conn?.label) {
            (conn.label as Text).text = text;
        }
    }

    /**
     * 历史变更后同步标签可见性：
     * 线被撤销 → 隐藏标签；线被重做 → 恢复标签
     */
    private _onHistoryChange = () => {
        queueMicrotask(() => this._syncConnectionLabels());
    };

    private _syncConnectionLabels() {
        this.connections.forEach((conn) => {
            if (!conn.label) return;
            const lineInTree = !!this.editorBoard.getById(conn.line?.id as string);
            const labelInTree = !!this.editorBoard.getById(conn.label.id as string);
            if (!lineInTree && labelInTree) {
                try { conn.label.remove(); } catch { /* already removed */ }
            }
            if (lineInTree && !labelInTree) {
                try { this.editorBoard.app.tree.add(conn.label); } catch { /* re-add failed */ }
            }
        });
    }

    public getSerializableConnections(): ISerializedConnection[] {
        return this.connections
            .filter((conn) => conn.from?.id && conn.to?.id && conn.line?.id)
            .map((conn) => ({
                fromId: conn.from.id as string,
                toId: conn.to.id as string,
                lineId: conn.line.id as string,
                labelId: (conn.label?.id as string) || undefined,
                labelText: (conn.label as any)?.text || undefined,
            }));
    }

    public restoreConnections(data: ISerializedConnection[]) {
        this.connections = [];
        data.forEach((item) => {
            const from = this.editorBoard.getById(item.fromId);
            const to = this.editorBoard.getById(item.toId);
            const line = this.editorBoard.getById(item.lineId);
            if (from && to && line) {
                let label: IUI | null = null;
                if (item.labelId) {
                    label = this.editorBoard.getById(item.labelId) as IUI | null;
                }
                if (!label && line) {
                    const { p0, p3 } = getBestConnectionByWorldBoxBounds(from, to, this.editorBoard.app);
                    const isCurve = (line as IUI).tag === "Path";
                    const mid = isCurve ? getBezierMidpoint(p0, p3) : getLineMidpoint(p0, p3);
                    label = this._createLabel(mid.x, mid.y);
                    if (item.labelText) (label as any).text = item.labelText;
                    this.editorBoard.addLeaferElement(label);
                }
                this.connections.push({
                    from: from as IUIInputData,
                    to: to as IUIInputData,
                    line: line as IUI,
                    label,
                });
            }
        });
    }

    public destroy() {
        this._unListenners();
        this.dragHandlers.clear();
        this.connections.forEach((conn) => {
            try { conn.label?.remove(); } catch { /* ignore */ }
        });
        this.connections.length = 0;
        this._updateRelatedLinesThrottled.cancel();
    }
}
