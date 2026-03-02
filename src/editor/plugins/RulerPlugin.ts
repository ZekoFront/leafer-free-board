import { App, Group, LayoutEvent, Line, Rect, ResizeEvent, Text } from "leafer-ui";
import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
import { EditorEvent } from "@leafer-in/editor";
// import { Ruler } from "leafer-x-ruler";

export const HALF_PI = Math.PI / 2

export class RulerPlugin implements IPluginTempl {
    static pluginName = "RulerPlugin";
    static apis = [];
    static hotkeys: string[] = [];

    group = new Group()
    /** 文字颜色 */
    textColor = '#aaa'
    /** 背景颜色 */
    bgColor = '#fff'
    /** 间隔线颜色 */
    lineColor = '#ccc'
    /** 下边框颜色 */
    borderColor = '#ccc'
    /** 遮罩颜色 */
    maskColor = '#e2ebff'
    app: App;

    constructor(editorBoard: EditorBoard) {
        // 实例化标尺插件
        // const ruler = new Ruler(editorBoard.app as any)
        // ruler.enabled = true
        this.app = editorBoard.app
        this.app.sky.add(this.group)
        this.listen()
    }

    get visible(): boolean {
        return this.group.visible || false
    }
    set visible(visible: boolean) {
        this.group.visible = visible
        this.drawShape()
    }

    listen() {
        this.app.tree.on(LayoutEvent.AFTER, this.drawShape)
        this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
        this.app.editor.on(EditorEvent.SELECT, this.drawShape)
    }

    drawShape = () => {
        if (this.visible) {
            this.group.clear()
            this.drawRect()
            this.drawXRuler()
            this.drawYRuler()
            this.drawMask()
        }
    }
    /** 绘制背景 */
    drawRect() {
        const { width, height } = this.app
        // 背景色
        this.group.add(new Rect({
            width: width,
            height: 20,
            fill: this.bgColor,
            zIndex: 10,
        }))
        this.group.add(new Rect({
            width: 20,
            height: height,
            fill: this.bgColor,
            zIndex: 10,
        }))
        // 线条
        this.group.add(new Line({
            width: width,
            strokeWidth: 1,
            stroke: this.borderColor,
            x: 0,
            y: 20,
            zIndex: 50,
        }))
        this.group.add(new Line({
            width: width,
            strokeWidth: 1,
            stroke: this.borderColor,
            rotation: 90,
            x: 20,
            y: 0,
            zIndex: 50,
        }))
        // 背景+文字
        this.group.add(new Rect({
            width: 20,
            height: 20,
            fill: this.bgColor,
            zIndex: 40
        }))
        this.group.add(new Text({
            x: 9,
            y: 9,
            text: `px`,
            zIndex: 40,
            fill: this.textColor,
            fontSize: 10,
            textAlign: 'center',
            verticalAlign: 'middle',
        }))
    }
    drawXRuler = () => {
        const zoom = this.getZoom()
        const stepInScene = this.getStepByZoom(zoom)
        const { x: x1 } = this.app.getPagePoint({ x: 0, y: 0 })
        let startX = this.getClosestTimesVal(x1, stepInScene as number)
        const { x: x2 } = this.app.getPagePoint({ x: this.app.width!, y: 0 })
        const endX = this.getClosestTimesVal(x2, stepInScene as number)
        // console.log('startX', x1, startX, x2, endX, zoom, stepInScene);
        while (startX <= endX) {
            const x = (startX - x1) * zoom
            const line = new Line({
                width: 6,
                strokeWidth: 1,
                stroke: this.lineColor,
                rotation: 90,
                x: x,
                y: 14,
                zIndex: 30
            })
            this.group.add(line)
            const text = new Text({
                x,
                y: 8,
                fill: this.textColor,
                fontSize: 10,
                text: `${startX}`,
                textAlign: 'center',
                verticalAlign: 'middle',
                zIndex: 30
            })
            this.group.add(text)
            startX += Number(stepInScene)
        }

    }
    drawYRuler = () => {
        const zoom = this.getZoom()
        const stepInScene = this.getStepByZoom(zoom)
        const { y: y1 } = this.app.getPagePoint({ x: 0, y: 0 })
        let startY = this.getClosestTimesVal(y1, stepInScene as number)
        const { y: y2 } = this.app.getPagePoint({ x: 0, y: this.app.height! })
        const endY = this.getClosestTimesVal(y2, stepInScene as number)
        // console.log('startXY',y1,startY,y2,endY,zoom,stepInScene);
        while (startY <= endY) {
            const y = (startY - y1) * zoom
            const line = new Line({
                width: 6,
                strokeWidth: 1,
                stroke: this.lineColor,
                x: 14,
                y: y,
                zIndex: 30
            })
            this.group.add(line)
            const text = new Text({
                x: 8,
                y,
                fill: this.textColor,
                fontSize: 10,
                rotation: -90,
                text: `${startY}`,
                textAlign: 'center',
                verticalAlign: 'middle',
                zIndex: 30
            })
            this.group.add(text)
            startY += Number(stepInScene)
        }

    }
    /** 选中图形的遮罩 */
    drawMask() {
        const graphs = this.app.editor.list || []
        for (let i = 0; i < graphs.length; i++) {
            const graph = graphs[i];
            const bounds = graph?.getBounds()
            const rectX = new Rect({
                width: bounds?.width,
                height: 20,
                fill: this.maskColor,
                x: bounds?.x,
                zIndex: 20
            })
            this.group.add(rectX)
            const rectY = new Rect({
                width: 20,
                height: bounds?.height,
                fill: this.maskColor,
                y: bounds?.y,
                zIndex: 20
            })
            this.group.add(rectY)
        }
    }

    getZoom(): number {
        if (this.app.tree) {
            if (typeof this.app.tree.scale === 'number') {
                return this.app.tree.scale
            } else {
                return 1
            }
        } else {
            return 1
        }
    }

    getStepByZoom = (zoom: number) => {
        /**
         * 步长研究，参考 figma
         * 1
         * 2
         * 5
         * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
         * 25（对应 200% 往上）
         * 50（对应 100% 往上）
         * 100（对应 50% 往上）
         * 250
         * 500
         * 1000
         * 2500
         * 5000
         */
        const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
        const step = 50 / zoom
        for (let i = 0, len = steps.length; i < len; i++) {
            if (Number(steps[i]) >= step) return steps[i]
        }
        return steps[0]
    }
    /**
     * 找出离 value 最近的 segment 的倍数值
     */
    getClosestTimesVal = (value: number, segment: number) => {
        const n = Math.floor(value / segment)
        const left = segment * n
        const right = segment * (n + 1)
        // console.log('====', value, segment, n, left, right)

        return value - left <= right - value ? left : right
    }

    public destroy() {
        RulerPlugin.apis = [];
        RulerPlugin.hotkeys = [];
        this.app.tree.off(LayoutEvent.AFTER, this.drawShape)
        this.app.tree.off(ResizeEvent.RESIZE, this.drawShape)
        this.app.editor.off(EditorEvent.SELECT, this.drawShape)
    }
}
