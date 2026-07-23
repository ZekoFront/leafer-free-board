import { App, Group, LayoutEvent, Line, Rect, ResizeEvent, Text } from "leafer-ui";
import { EditorEvent } from "@leafer-in/editor";
import type EditorCore from "@/core/EditorCore";
import type { IPluginOption } from "@/core/types";

export const HALF_PI = Math.PI / 2;

export class RulerPlugin {
    static pluginName = "RulerPlugin";
    static apis: string[] = [];
    static hotkeys: string[] = [];
    static events: string[] = [];

    pluginName = RulerPlugin.pluginName;
    group = new Group();
    textColor = "#9ca3af";
    bgColor = "#fafafa";
    lineColor = "#d1d5db";
    borderColor = "#e5e7eb";
    maskColor = "rgba(99, 102, 241, 0.1)";
    app: App;

    constructor(
        public editor: EditorCore,
        _options?: IPluginOption,
    ) {
        this.app = this.editor.app;
        this.app.sky.add(this.group);
        this.group.visible = true;
        this.listen();
    }

    get visible(): boolean {
        return this.group.visible || false;
    }

    set visible(visible: boolean) {
        this.group.visible = visible;
        this.drawShape();
    }

    listen() {
        this.app.tree.on(LayoutEvent.AFTER, this.drawShape);
        this.app.tree.on(ResizeEvent.RESIZE, this.drawShape);
        this.app.editor.on(EditorEvent.SELECT, this.drawShape);
    }

    drawShape = () => {
        if (this.visible) {
            this.group.clear();
            this.drawRect();
            this.drawXRuler();
            this.drawYRuler();
            this.drawMask();
        }
    };

    drawRect() {
        const { width, height } = this.app;
        this.group.add(
            new Rect({
                width: width,
                height: 20,
                fill: this.bgColor,
                zIndex: 10,
            }),
        );
        this.group.add(
            new Rect({
                width: 20,
                height: height,
                fill: this.bgColor,
                zIndex: 10,
            }),
        );
        this.group.add(
            new Line({
                width: width,
                strokeWidth: 1,
                stroke: this.borderColor,
                x: 0,
                y: 20,
                zIndex: 50,
            }),
        );
        this.group.add(
            new Line({
                width: width,
                strokeWidth: 1,
                stroke: this.borderColor,
                rotation: 90,
                x: 20,
                y: 0,
                zIndex: 50,
            }),
        );
        this.group.add(
            new Rect({
                width: 20,
                height: 20,
                fill: this.bgColor,
                zIndex: 40,
            }),
        );
        this.group.add(
            new Text({
                x: 9,
                y: 9,
                text: "px",
                zIndex: 40,
                fill: this.textColor,
                fontSize: 10,
                textAlign: "center",
                verticalAlign: "middle",
            }),
        );
    }

    drawXRuler = () => {
        const zoom = this.getZoom();
        const stepInScene = this.getStepByZoom(zoom);
        const { x: x1 } = this.app.getPagePoint({ x: 0, y: 0 });
        let startX = this.getClosestTimesVal(x1, stepInScene as number);
        const { x: x2 } = this.app.getPagePoint({ x: this.app.width!, y: 0 });
        const endX = this.getClosestTimesVal(x2, stepInScene as number);

        while (startX <= endX) {
            const x = (startX - x1) * zoom;
            this.group.add(
                new Line({
                    width: 6,
                    strokeWidth: 1,
                    stroke: this.lineColor,
                    rotation: 90,
                    x: x,
                    y: 14,
                    zIndex: 30,
                }),
            );
            this.group.add(
                new Text({
                    x,
                    y: 8,
                    fill: this.textColor,
                    fontSize: 10,
                    text: `${startX}`,
                    textAlign: "center",
                    verticalAlign: "middle",
                    zIndex: 30,
                }),
            );
            startX += Number(stepInScene);
        }
    };

    drawYRuler = () => {
        const zoom = this.getZoom();
        const stepInScene = this.getStepByZoom(zoom);
        const { y: y1 } = this.app.getPagePoint({ x: 0, y: 0 });
        let startY = this.getClosestTimesVal(y1, stepInScene as number);
        const { y: y2 } = this.app.getPagePoint({ x: 0, y: this.app.height! });
        const endY = this.getClosestTimesVal(y2, stepInScene as number);

        while (startY <= endY) {
            const y = (startY - y1) * zoom;
            this.group.add(
                new Line({
                    width: 6,
                    strokeWidth: 1,
                    stroke: this.lineColor,
                    x: 14,
                    y: y,
                    zIndex: 30,
                }),
            );
            this.group.add(
                new Text({
                    x: 8,
                    y,
                    fill: this.textColor,
                    fontSize: 10,
                    rotation: -90,
                    text: `${startY}`,
                    textAlign: "center",
                    verticalAlign: "middle",
                    zIndex: 30,
                }),
            );
            startY += Number(stepInScene);
        }
    };

    drawMask() {
        const graphs = this.app.editor.list || [];
        for (let i = 0; i < graphs.length; i++) {
            const graph = graphs[i];
            const bounds = graph?.getBounds();
            this.group.add(
                new Rect({
                    width: bounds?.width,
                    height: 20,
                    fill: this.maskColor,
                    x: bounds?.x,
                    zIndex: 20,
                }),
            );
            this.group.add(
                new Rect({
                    width: 20,
                    height: bounds?.height,
                    fill: this.maskColor,
                    y: bounds?.y,
                    zIndex: 20,
                }),
            );
        }
    }

    getZoom(): number {
        if (this.app.tree) {
            if (typeof this.app.tree.scale === "number") {
                return this.app.tree.scale;
            }
            return 1;
        }
        return 1;
    }

    getStepByZoom = (zoom: number) => {
        const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
        const step = 50 / zoom;
        for (let i = 0, len = steps.length; i < len; i++) {
            if (Number(steps[i]) >= step) return steps[i];
        }
        return steps[0];
    };

    getClosestTimesVal = (value: number, segment: number) => {
        const n = Math.floor(value / segment);
        const left = segment * n;
        const right = segment * (n + 1);
        return value - left <= right - value ? left : right;
    };

    destroy() {
        this.app.tree.off(LayoutEvent.AFTER, this.drawShape);
        this.app.tree.off(ResizeEvent.RESIZE, this.drawShape);
        this.app.editor.off(EditorEvent.SELECT, this.drawShape);
        this.group.remove();
    }
}
