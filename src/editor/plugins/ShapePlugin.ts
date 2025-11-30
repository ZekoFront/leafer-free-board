import { Ellipse, PointerEvent, type IPointData, type IUI, type IUIInputData } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IDrawState, type IPluginTempl } from "../types";
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
    private element: IUIInputData | null = null
    private points: IPointData[] = []
    private dragHandlers: Map<string, (e: DragEvent) => void> = new Map();
    private isDrawing = false
    // 处理拖拽生成图形
    private leafer:HTMLDivElement|undefined;
    private point:IUIInputData | null = null
    // 初始化一个空函数作为默认值
    private callBack: (state:IDrawState) => void = () => {}; 
    constructor(public editorBoard: EditorBoard) {
        this._listenners()
    }

    protected setToolbarActive(type: string, callBack:(state?:IDrawState)=>void) {
        this.toolbarActiveType = type
        // 需要手动拖拽绘制的图形
        if (type==='arrow') {
            this.editorBoard.app.cursor = 'crosshair'
            this.editorBoard.app.editor.config.selector = false
        } else {
            this.editorBoard.app.cursor = 'pointer'
            this.editorBoard.app.editor.config.selector = true
        }
        this.callBack = callBack
        console.log('设置工具栏激活状态:', type)
    }

    private _listenners() {
        this.toolbars.forEach(item => {
            // 这里的逻辑取决于 _onDragElementListener 内部实现
            // 如果内部也是 addEventListener，也需要确保引用一致
            if (!this.excludeTypes.includes(item.type)) this._onDragElementListener(item.type)
        })

        this.leafer = document.getElementById('leafer') as HTMLDivElement
        
        // 2. 传入函数引用，而不是匿名包装函数
        if (this.leafer) {
            this.leafer.addEventListener('dragover', this._onDragLeaferOver);
            this.leafer.addEventListener('drop', this._onDropLeafer);
        }

        // 指针事件监听
        // 直接传入 this._onDownPointer 引用
        this.editorBoard.app.on(PointerEvent.DOWN, this._onDownPointer)
        this.editorBoard.app.on(PointerEvent.MOVE, this._onMovePointer)
        this.editorBoard.app.on(PointerEvent.UP, this._onUpPointer)
    }

    private _onDragLeaferOver = (evt:DragEvent) => {
        evt.preventDefault()
    }

    private _unListenners() {
        this.toolbars.forEach(item => {
           if (!this.excludeTypes.includes(item.type)) this._onDragElementRemoveListener(item.type)
        })

        // 3. 移除时传入完全相同的引用
        if (this.leafer) {
            this.leafer.removeEventListener('dragover', this._onDragLeaferOver);
            this.leafer.removeEventListener('drop', this._onDropLeafer);
        }

        this.editorBoard.app.off(PointerEvent.DOWN, this._onDownPointer)
        this.editorBoard.app.off(PointerEvent.MOVE, this._onMovePointer)
        this.editorBoard.app.off(PointerEvent.UP, this._onUpPointer)
    }

    private _onDownPointer = (_evt:PointerEvent) => {
        console.log(_evt, 666)
        this.point = new Ellipse({
            width: 10,
            height: 10,
            x: _evt.x,
            y: _evt.y,
            fill: "#C71585"
        })
        this.editorBoard.addLeaferElement(this.point)
        // this.editorBoard.app.editor.cancel()
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
        if (this.element && this.element.data) {
            this.element.data.executeType = ExecuteTypeEnum.AddElement
            this.editorBoard.history.execute(this.element)
        }
        this.isDrawing = false
        this.element = null
        this.points = []
        this.editorBoard.app.editor.config.selector = true
        this.editorBoard.app.cursor = 'default'
        this.callBack({ type: this.toolbarActiveType, state: 'success' })
    }

    private _onDragElementListener (type:string) {
        const element = document.getElementById(type);
        if (!element) return;

        const handler = (e: DragEvent) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData("type", type);
            }
        };

        this.dragHandlers.set(type, handler);
        element.addEventListener('dragstart', handler);
    }

    private _onDragElementRemoveListener = (type: string) => {
        const element = document.getElementById(type);
        const handler = this.dragHandlers.get(type);

        if (element && handler) {
            element.removeEventListener('dragstart', handler);
            this.dragHandlers.delete(type);
        }
    }

    private _onDropLeafer = (e:DragEvent) => {
        if (e.dataTransfer) {
            const type = e.dataTransfer.getData("type")
            // 浏览器原生事件的 client 坐标 转 应用的 page 坐标
            const point = this.editorBoard.app.getPagePointByClient(e)
            // 根据拖拽类型生成图形
            const shape = createShape(type, point)
            if (shape) {
                shape.data.executeType = ExecuteTypeEnum.AddElement
                console.log('生成图形:', shape)
                const res = this.editorBoard.addLeaferElement(shape)
                if (res) {
                    this.editorBoard.history.execute(shape)
                }
            }
        }
        
        e.preventDefault()
    }

    public destroy () {
        this._unListenners()
        this.dragHandlers.clear()
    }
}