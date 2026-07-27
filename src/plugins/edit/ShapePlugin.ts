import {
    PointerEvent,
    DragEvent as LeaferDragEvent,
    Pen,
    Line,
    type IPointData,
    type IUI,
    type IUIInputData,
} from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import type EditorCore from "@/core/EditorCore";
import { getDraggableElementTypes } from "@/config/element-palette";
import { MIN_CONNECTION_LABEL_GAP } from "@/core/constants";

import {
    createElement,
    createPaintbrushPen,
    createSegmentByPoints,
    distanceBetweenPoints,
    MIN_PAINTBRUSH_POINTS,
    MIN_SEGMENT_LENGTH,
    PAINTBRUSH_STYLE,
    type ConnectionToolKind,
    type SegmentKind,
    updateSegmentPoints,
} from "@/core/elements";

import {
    createConnectionByKind,
    createConnectionLabel,
    createConnectionPreviewLine,
} from "@/core/elements/connection";

import {
    enforceMinGap,
    getBestConnectionByWorldBoxBounds,
    getRectBounds,
} from "@/core/geometry";

import type { ConnectionKind, IDrawState, IPluginTempl } from "@/core/types";

const DRAGGABLE_TYPES = getDraggableElementTypes();

/** 画布两点自由绘制 */

const FREE_SEGMENT_TOOLS = new Set<SegmentKind>(["arrow"]);

/** 元素间连线（四边识别） */

const CONNECTION_TOOLS = new Set<ConnectionToolKind>(["line", "curve"]);

type ActiveDrawTool = SegmentKind | ConnectionToolKind | "paintbrush" | null;

function isFreeSegmentTool(type: string): type is SegmentKind {
    return FREE_SEGMENT_TOOLS.has(type as SegmentKind);
}

function isConnectionTool(type: string): type is ConnectionToolKind {
    return CONNECTION_TOOLS.has(type as ConnectionToolKind);
}

/**

 * ShapePlugin — 图形创建与绘制交互
 *
 * - 拖拽 drop：rect / text 等 draggable 工具栏项
 * - arrow：画布两点自由画箭头
 * - line / curve：从元素 A 拖到元素 B，四边贴边连线（见 ConnectionPlugin）
 * - paintbrush：Pen + DragEvent 自由绘制
 */
export class ShapePlugin implements IPluginTempl {
    static pluginName = "ShapePlugin";
    static apis = ["setToolbarActive"];
    pluginName = ShapePlugin.pluginName;
    private view: HTMLElement;
    private activeTool: ActiveDrawTool = null;
    private drawCallback: ((state?: IDrawState) => void) | null = null;

    // arrow 自由绘制状态
    private isDrawing = false;
    private startPoint: IPointData | null = null;
    private previewElement: IUI | null = null;

    // paintbrush 状态
    private paintingPen: Pen | null = null;
    private isPainting = false;
    private paintPointCount = 0;
    private paintPreviewOnTree = false;

    // line/curve 元素连线状态
    private startNode: IUI | null = null;
    private connectionPreview: Line | null = null;
    private isConnectionDrawing = false;
    /** 绘制连线/箭头时临时锁定 draggable，避免拖线时把元素一起拖走 */
    private lockedDragTarget: IUI | null = null;
    private lockedDragTargetDraggable: IUI["draggable"] | null = null;

    constructor(public editor: EditorCore) {
        this.view = this.editor.app.view as HTMLElement;
        this.view.addEventListener("dragover", this.onDragOver);
        this.view.addEventListener("drop", this.onDrop);

        const app = this.editor.app;

        app.on(PointerEvent.DOWN, this.onPointerDown);
        app.on(PointerEvent.MOVE, this.onPointerMove);
        app.on(PointerEvent.UP, this.onPointerUp);
        // 自由绘制：Pen + DragEvent，钢笔工具在用
        app.on(LeaferDragEvent.START, this.onPaintbrushDragStart);
        app.on(LeaferDragEvent.DRAG, this.onPaintbrushDrag);
        app.on(LeaferDragEvent.END, this.onPaintbrushDragEnd);
    }

    setToolbarActive(type: string, callBack?: (state?: IDrawState) => void) {
        this.cancelSegmentDraw();
        this.cancelConnectionDraw();
        this.cancelPaintbrushStroke();
        this.drawCallback = callBack ?? null;
        const app = this.editor.app;
        if (type === "paintbrush") {
            this.activeTool = "paintbrush";
            app.cursor = "default";
            app.editor.config.selector = false;
            return;
        }

        if (isFreeSegmentTool(type)) {
            this.activeTool = type;
            app.cursor = "crosshair";
            app.editor.config.selector = false;
            return;
        }

        if (isConnectionTool(type)) {
            this.activeTool = type;
            app.cursor = "crosshair";
            app.editor.config.selector = false;
            return;
        }

        this.activeTool = null;
        app.cursor = "default";
        app.editor.config.selector = true;
    }

    private onDragOver = (evt: DragEvent) => {
        evt.preventDefault();
    };

    private onDrop = (e: DragEvent) => {
        const type = e.dataTransfer?.getData("type");
        if (!type || !DRAGGABLE_TYPES.has(type)) return;
        const point = this.editor.app.getPagePointByClient(e);
        const shape = createElement(type, point);

        if (!shape || !(shape as { tag?: string }).tag) return;

        this.addToCanvas(shape);
        e.preventDefault();
    };

    // paintbrush 自由绘制
    private onPaintbrushDragStart = (evt: LeaferDragEvent) => {
        if (this.activeTool !== "paintbrush") return;
        this.editor.app.editor.cancel?.();
        const point = evt.getPagePoint();
        this.paintingPen = createPaintbrushPen();
        this.paintingPen.setStyle(PAINTBRUSH_STYLE);
        this.paintingPen.moveTo(point.x, point.y);
        this.isPainting = true;
        this.paintPointCount = 1;
        this.paintPreviewOnTree = false;
    };

    private onPaintbrushDrag = (evt: LeaferDragEvent) => {
        if (
            this.activeTool !== "paintbrush" ||
            !this.isPainting ||
            !this.paintingPen
        ) {
            return;
        }

        const point = evt.getPagePoint();
        this.paintingPen.lineTo(point.x, point.y);
        this.paintPointCount += 1;

        if (!this.paintPreviewOnTree) {
            this.paintPreviewOnTree = true;
            this.editor.runWithoutRecording?.(() => {
                this.editor.app.tree.add(this.paintingPen!);
            });
        }
    };

    private onPaintbrushDragEnd = () => {
        if (this.activeTool !== "paintbrush") return;
        this.isPainting = false;
        const pen = this.paintingPen;
        const pointCount = this.paintPointCount;
        const previewOnTree = this.paintPreviewOnTree;

        this.paintingPen = null;
        this.paintPointCount = 0;
        this.paintPreviewOnTree = false;

        if (!pen) return;

        if (previewOnTree) {
            this.editor.runWithoutRecording?.(() => {
                pen.remove();
            });
        }

        if (pointCount < MIN_PAINTBRUSH_POINTS) return;

        this.editor.app.tree.add(pen);
    };

    // ── pointer：arrow / line / curve ───────────────────────
    private onPointerDown = (evt: PointerEvent) => {
        if (!this.activeTool) return;

        // arrow：任意位置按下即可开始
        if (isFreeSegmentTool(this.activeTool)) {
            this.editor.app.editor.cancel?.();
            // 十字模式下点在元素上时，禁止元素跟随鼠标拖拽（旧版 ShapePlugin 同理）
            this.lockTargetDraggable(evt.target as IUI);
            this.startPoint = evt.getPagePoint();
            this.previewElement = createSegmentByPoints(
                this.startPoint,
                this.startPoint,
            );

            this.previewElement.opacity = 0.65;
            this.isDrawing = false;
            return;
        }

        // line/curve：必须从有效元素上按下（排除连线标签）
        if (isConnectionTool(this.activeTool)) {
            const target = evt.target as IUI;

            if (
                !target?.id ||
                this.editor.isConnectionLabel?.(target) ||
                this.editor.isConnectionLine?.(target)
            ) {
                return;
            }

            this.editor.app.editor.cancel?.();
            // 从元素拖出连线时锁定起点，防止元素随鼠标移动
            this.lockTargetDraggable(target);
            this.startNode = target;
            const center = this.getElementCenter(target);

            // 预览：起点元素中心 → 当前鼠标（虚线，非四边）
            this.connectionPreview = createConnectionPreviewLine(
                center,
                evt.getPagePoint(),
            );
            this.isConnectionDrawing = false;
        }
    };

    private onPointerMove = (evt: PointerEvent) => {
        // line/curve 连线预览
        if (
            this.startNode &&
            this.connectionPreview &&
            isConnectionTool(this.activeTool!)
        ) {
            const center = this.getElementCenter(this.startNode);
            const end = evt.getPagePoint();
            this.connectionPreview.points = [
                center.x,
                center.y,
                end.x,
                end.y,
            ];

            if (!this.isConnectionDrawing) {
                this.isConnectionDrawing = true;
                this.editor.runWithoutRecording?.(() => {
                    this.editor.app.tree.add(this.connectionPreview!);
                });
            }

            return;
        }

        // arrow 自由绘制预览
        if (
            !isFreeSegmentTool(this.activeTool!) ||
            !this.startPoint ||
            !this.previewElement
        ) {
            return;
        }

        const endPoint = evt.getPagePoint();

        updateSegmentPoints(this.previewElement, this.startPoint, endPoint);

        if (!this.isDrawing) {
            this.isDrawing = true;

            this.editor.runWithoutRecording?.(() => {
                this.editor.app.tree.add(this.previewElement!);
            });
        }
    };

    private onPointerUp = (evt: PointerEvent) => {
        try {
            // line/curve：拾取目标元素并完成四边连线
            if (this.startNode && isConnectionTool(this.activeTool!)) {
            const kind = this.activeTool as ConnectionKind;
            const preview = this.connectionPreview;
            const from = this.startNode;
            this.resetConnectionState();
            if (preview?.parent) {
                this.editor.runWithoutRecording?.(() => {
                    preview.remove();
                });
            }

            const endNode = this.resolveConnectionTarget(evt, from);

            if (!endNode) {
                this.finishDrawMode(kind, "cancel");
                return;
            }

            // 四边识别：根据两元素相对位置选上/右/下/左边中点
            let { p0, p3 } = getBestConnectionByWorldBoxBounds(
                from,
                endNode,
                this.editor.app,
            );

            ({ p0, p3 } = enforceMinGap(
                p0,
                p3,
                MIN_CONNECTION_LABEL_GAP,
            ));

            const line = createConnectionByKind(kind, p0, p3);
            const label = createConnectionLabel(kind, p0, p3);
            this.editor.app.tree.add(line);
            this.editor.app.tree.add(label);
            this.editor.addConnection?.(from, endNode, line, label);
            this.finishDrawMode(kind, "success");
            return;
        }

        // arrow：两点距离足够则创建
        if (!isFreeSegmentTool(this.activeTool!) || !this.startPoint) {
            return;
        }

        const mode = this.activeTool;
        const start = this.startPoint;
        const end = evt.getPagePoint();
        const preview = this.previewElement;

        this.resetSegmentState();

        if (preview?.parent) {
            this.editor.runWithoutRecording?.(() => {
                preview.remove();
            });
        }

        if (distanceBetweenPoints(start, end) < MIN_SEGMENT_LENGTH) {
            this.finishDrawMode(mode, "cancel");

            return;
        }

        const segment = createSegmentByPoints(start, end);
        this.editor.app.tree.add(segment);
        this.finishDrawMode(mode, "success");
        } finally {
            // 无论成功/取消，都恢复绘制期间被锁定的元素 draggable
            this.unlockTargetDraggable();
        }
    };

    /**

     * 抬起时 pick 落点元素；兼容 Group 子元素（连到 Group 本身）。

     */
    private resolveConnectionTarget(
        evt: PointerEvent,

        from: IUI,
    ): IUI | null {
        const picked = this.editor.app.tree.pick({ x: evt.x, y: evt.y });

        let target = picked?.target as IUI | undefined;

        if (!target?.id || this.editor.isConnectionLabel?.(target)) return null;

        if (target === from) return null;

        // 落点在 Group 子元素上时，连线目标提升为 Group

        const parent = target.parent;

        if (parent?.tag === "Group" && parent !== from && parent.id) {
            target = parent as IUI;
        }

        if (target === from) return null;

        return target;
    }

    /** 绘制模式下临时禁止元素被拖拽，抬起后 restore */
    private lockTargetDraggable(target: IUI | undefined) {
        this.unlockTargetDraggable();
        if (!target?.id) return;
        if (this.editor.isConnectionLabel?.(target)) return;
        if (this.editor.isConnectionLine?.(target)) return;

        this.lockedDragTarget = target;
        this.lockedDragTargetDraggable = target.draggable ?? true;
        target.draggable = false;
        // 清空编辑器选中，避免编辑框与绘制手势冲突
        this.editor.app.editor.target = undefined;
    }

    private unlockTargetDraggable() {
        if (this.lockedDragTarget && this.lockedDragTargetDraggable !== null) {
            this.lockedDragTarget.draggable = this.lockedDragTargetDraggable;
        }
        this.lockedDragTarget = null;
        this.lockedDragTargetDraggable = null;
    }

    private getElementCenter(el: IUI) {
        const bounds = getRectBounds(el, this.editor.app);

        return { x: bounds.centerX, y: bounds.centerY };
    }

    private finishDrawMode(mode: SegmentKind | ConnectionKind, state: string) {
        this.drawCallback?.({ type: mode, state });
        this.drawCallback = null;
        this.activeTool = null;
        this.editor.app.cursor = "default";
        this.editor.app.editor.config.selector = true;
    }

    private cancelSegmentDraw() {
        if (this.previewElement?.parent) {
            this.editor.runWithoutRecording?.(() => {
                this.previewElement?.remove();
            });
        }
        this.unlockTargetDraggable();
        this.resetSegmentState();
    }

    private cancelConnectionDraw() {
        if (this.connectionPreview?.parent) {
            this.editor.runWithoutRecording?.(() => {
                this.connectionPreview?.remove();
            });
        }
        this.unlockTargetDraggable();
        this.resetConnectionState();
    }

    private cancelPaintbrushStroke() {
        if (this.paintingPen?.parent) {
            this.editor.runWithoutRecording?.(() => {
                this.paintingPen?.remove();
            });
        }

        this.paintingPen = null;
        this.isPainting = false;
        this.paintPointCount = 0;
        this.paintPreviewOnTree = false;
    }

    private resetSegmentState() {
        this.isDrawing = false;
        this.startPoint = null;
        this.previewElement = null;
    }

    private resetConnectionState() {
        this.startNode = null;
        this.connectionPreview = null;
        this.isConnectionDrawing = false;
    }

    private addToCanvas(element: IUIInputData) {
        const tree = this.editor.app.tree;

        if (!tree) return;

        if (!element.id) element.id = uuidv4();

        tree.add(element);
    }

    destroy() {
        this.cancelSegmentDraw();
        this.cancelConnectionDraw();
        this.cancelPaintbrushStroke();
        this.unlockTargetDraggable();
        this.activeTool = null;
        this.drawCallback = null;
        this.view.removeEventListener("dragover", this.onDragOver);
        this.view.removeEventListener("drop", this.onDrop);
        const app = this.editor.app;
        app.off(PointerEvent.DOWN, this.onPointerDown);
        app.off(PointerEvent.MOVE, this.onPointerMove);
        app.off(PointerEvent.UP, this.onPointerUp);
        app.off(LeaferDragEvent.START, this.onPaintbrushDragStart);
        app.off(LeaferDragEvent.DRAG, this.onPaintbrushDrag);
        app.off(LeaferDragEvent.END, this.onPaintbrushDragEnd);
    }
}
