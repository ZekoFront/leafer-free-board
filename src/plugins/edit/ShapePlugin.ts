import {
    PointerEvent,
    DragEvent as LeaferDragEvent,
    Pen,
    type IPointData,
    type IUI,
    type IUIInputData,
} from "leafer-ui";

import { v4 as uuidv4 } from "uuid";

import type EditorCore from "@/core/EditorCore";

import { toolbarMenu } from "@/config";

import {
    createElement,
    createPaintbrushPen,
    createSegmentByPoints,
    distanceBetweenPoints,
    MIN_PAINTBRUSH_POINTS,
    MIN_SEGMENT_LENGTH,
    PAINTBRUSH_STYLE,
    type SegmentKind,
    updateSegmentPoints,
} from "@/core/elements";

import { type IDrawState, type IPluginTempl } from "@/core/types";

const DRAGGABLE_TYPES = new Set(
    toolbarMenu.filter((item) => item.draggable).map((item) => item.type),
);

const SEGMENT_TOOLS = new Set<SegmentKind>(["arrow", "line", "curve"]);

type ActiveDrawTool = SegmentKind | "paintbrush" | null;

function isSegmentTool(type: string): type is SegmentKind {
    return SEGMENT_TOOLS.has(type as SegmentKind);
}

/**

 * ShapePlugin — 图形创建

 *

 * - 拖拽：rect / text 等 draggable 工具栏项 → drop 单点创建

 * - 两点绘制：arrow / line / curve → 按下起点、拖动至终点、抬起完成

 * - 画笔：paintbrush → Pen + DragEvent 自由绘制，每笔独立元素

 */

export class ShapePlugin implements IPluginTempl {
    static pluginName = "ShapePlugin";

    static apis = ["setToolbarActive"];

    pluginName = ShapePlugin.pluginName;

    private view: HTMLElement;

    private activeTool: ActiveDrawTool = null;

    private drawCallback: ((state?: IDrawState) => void) | null = null;

    private isDrawing = false;

    private startPoint: IPointData | null = null;

    private previewElement: IUI | null = null;

    private paintingPen: Pen | null = null;

    private isPainting = false;

    private paintPointCount = 0;

    private paintPreviewOnTree = false;

    constructor(public editor: EditorCore) {
        this.view = this.editor.app.view as HTMLElement;

        this.view.addEventListener("dragover", this.onDragOver);

        this.view.addEventListener("drop", this.onDrop);

        const app = this.editor.app;

        app.on(PointerEvent.DOWN, this.onPointerDown);

        app.on(PointerEvent.MOVE, this.onPointerMove);

        app.on(PointerEvent.UP, this.onPointerUp);

        app.on(LeaferDragEvent.START, this.onPaintbrushDragStart);

        app.on(LeaferDragEvent.DRAG, this.onPaintbrushDrag);

        app.on(LeaferDragEvent.END, this.onPaintbrushDragEnd);
    }

    setToolbarActive(type: string, callBack?: (state?: IDrawState) => void) {
        this.cancelSegmentDraw();

        this.cancelPaintbrushStroke();

        this.drawCallback = callBack ?? null;

        const app = this.editor.app;

        if (type === "paintbrush") {
            this.activeTool = "paintbrush";

            app.cursor = "default";

            app.editor.config.selector = false;

            return;
        }

        if (isSegmentTool(type)) {
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

    private onPointerDown = (evt: PointerEvent) => {
        if (!this.activeTool || !isSegmentTool(this.activeTool)) return;

        this.editor.app.editor.cancel?.();

        this.startPoint = evt.getPagePoint();

        this.previewElement = createSegmentByPoints(
            this.activeTool,

            this.startPoint,

            this.startPoint,
        );

        this.previewElement.opacity = 0.65;

        this.isDrawing = false;
    };

    private onPointerMove = (evt: PointerEvent) => {
        if (
            !this.activeTool ||
            !isSegmentTool(this.activeTool) ||
            !this.startPoint ||
            !this.previewElement
        ) {
            return;
        }

        const endPoint = evt.getPagePoint();

        updateSegmentPoints(
            this.previewElement,

            this.activeTool,

            this.startPoint,

            endPoint,
        );

        if (!this.isDrawing) {
            this.isDrawing = true;

            this.editor.runWithoutRecording?.(() => {
                this.editor.app.tree.add(this.previewElement!);
            });
        }
    };

    private onPointerUp = (evt: PointerEvent) => {
        if (
            !this.activeTool ||
            !isSegmentTool(this.activeTool) ||
            !this.startPoint
        ) {
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

        const segment = createSegmentByPoints(mode, start, end);

        this.editor.app.tree.add(segment);

        this.finishDrawMode(mode, "success");
    };

    private finishDrawMode(mode: SegmentKind, state: string) {
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

        this.resetSegmentState();
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

    private addToCanvas(element: IUIInputData) {
        const tree = this.editor.app.tree;

        if (!tree) return;

        if (!element.id) element.id = uuidv4();

        tree.add(element);
    }

    destroy() {
        this.cancelSegmentDraw();

        this.cancelPaintbrushStroke();

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
