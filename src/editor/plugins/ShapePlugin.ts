import { PointerEvent, type IPointData, type IUI } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import type EditorBoard from "../EditorBoard";
import { type IPluginTempl } from "../types";
import { toolbars } from "@/scripts/toolBar";
import { createShape } from "../utils/creatShape";
export class ShapePlugin implements IPluginTempl {
    static pluginName = 'ShapePlugin';
    static apis = ['setToolbarActive'];
    static hotkeys: string[]= [];
    static events = ['testEvent'];
    public toolbars = toolbars;
    private toolbarActiveType = '';
    private excludeTypes = ['select','arrow'];
    private element: IUI | null = null
    private points: IPointData[] = []
    private isDrawing = false
    // 处理拖拽生成图形
    private leafer:HTMLDivElement|undefined;
    constructor(public editorBoard: EditorBoard) {
        // this._listenners()
    }

    protected setToolbarActive(type: string) {
        this.toolbarActiveType = type
        // 需要手动拖拽绘制的图形
        if (type==='arrow') {
            this.editorBoard.app.cursor = 'crosshair'
            this.editorBoard.app.editor.config.selector = false
        }
        console.log('设置工具栏激活状态:', type)
        this._listenners()
    }

    private _listenners() {
        this.toolbars.forEach(item => {
            if (!this.excludeTypes.includes(item.type)) this._onDragElementListener(item.type)
        })

        this.leafer = document.getElementById('leafer') as HTMLDivElement
        this.leafer.addEventListener('dragover', (evt) => evt.preventDefault())

        // 设置目标区域可接收拖拽
        this.leafer&&this.leafer.addEventListener('drop', (evt:DragEvent) => this._onDropLeafer(evt))
        this.editorBoard.app.on(PointerEvent.DOWN, (evt:PointerEvent) => this._onDownPointer(evt))
        this.editorBoard.app.on(PointerEvent.MOVE, (evt:PointerEvent) => this._onMovePointer(evt))
        this.editorBoard.app.on(PointerEvent.UP, (evt:PointerEvent) => this._onUpPointer(evt))
    }

    private _unListenners() {
        this.toolbars.forEach(item => {
           if (!this.excludeTypes.includes(item.type)) this._onDragElementRemoveListener(item.type)
        })
        this.leafer && this.leafer.removeEventListener('dragover', (evt) => evt.preventDefault())
        this.leafer&&this.leafer.removeEventListener('drop', (evt:DragEvent) => this._onDropLeafer(evt))
        this.editorBoard.app.off(PointerEvent.DOWN, (evt:PointerEvent) => this._onDownPointer(evt))
        this.editorBoard.app.off(PointerEvent.MOVE, (evt:PointerEvent) => this._onMovePointer(evt))
        this.editorBoard.app.off(PointerEvent.UP, (evt:PointerEvent) => this._onUpPointer(evt))
    }

    private _onDownPointer = (_evt:PointerEvent) => {
        if (this.editorBoard.app.editor&&this.editorBoard.app.cursor === 'crosshair') {
            this.editorBoard.app.editor.target = undefined
            // 绘制箭头
            if (this.toolbarActiveType == 'arrow') {
                const startPoint = _evt.getPagePoint()
                this.points.push(startPoint)
                this.element = createShape('arrow', startPoint) as unknown as IUI
            }
        }
    }
    private _onMovePointer = (_evt:PointerEvent) => {
        if (!this.element) return 
        if (this.editorBoard.app && !this.isDrawing) {
            this.editorBoard.app.tree.add(this.element)
            // 进入绘制状态
            this.isDrawing = true
        }
        const endPoint = _evt.getPagePoint()
        const arrow = this.element as Arrow
        if (this.points[0]) {
            arrow.points = [this.points[0].x, this.points[0].y, endPoint.x, endPoint.y]
        }
    }
    private _onUpPointer = (_evt:PointerEvent) => {
        this.isDrawing = false
        this.element = null
        this.points = []
        this.editorBoard.app.editor.config.selector = true
        this.editorBoard.app.cursor = 'default'
        this._unListenners()
    }

    private _onDragElementListener (type:string) {
        const element = document.getElementById(type)
        element&&element.addEventListener('dragstart', function (e:DragEvent) {
            e.dataTransfer&&e.dataTransfer.setData("type", type)
        })
    }

    private _onDragElementRemoveListener = (type: string) => {
        const element = document.getElementById(type)
        element&&element.removeEventListener('dragstart', function (e:DragEvent) {
            e.dataTransfer&&e.dataTransfer.setData("type", type)
        })
    }

    private _onDropLeafer (e:DragEvent) {
        if (e.dataTransfer) {
            const type = e.dataTransfer.getData("type")
            // 浏览器原生事件的 client 坐标 转 应用的 page 坐标
            const point = this.editorBoard.app.getPagePointByClient(e)
            // 根据拖拽类型生成图形
            console.log(type,point)
            const shape = createShape(type, point)
            shape && this.editorBoard.app.tree.add(shape)
        }
        this._unListenners()
        e.preventDefault()
    }

    public clear () {
    
    }
}