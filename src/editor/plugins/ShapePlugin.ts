import { Box, Text, PointerEvent } from "leafer-ui";
import type EditorBoard from "../EditorBoard";
import { type IPluginTempl } from "../types";
import { toolbars } from "@/scripts/toolBar";

export class ShapePlugin implements IPluginTempl {
    static pluginName = 'ShapePlugin';
    static apis = [];
    static hotkeys: string[]= [];
    public toolbars = toolbars;
    private options = {
        fill: '#32cd79',
        stroke: '#13ad8cff',
        fontColor: '#FFFFFF',
        cornerRadius: 10,
        opacity: 0.7,
    }
    // 处理拖拽生成图形
    private leafer:HTMLDivElement|undefined;
    private isMouseDown = true
    constructor(public editorBoard: EditorBoard) {
        this._listenners()
    }

    private _listenners() {
        // 监听拖拽元素
        this.toolbars.forEach(item => {
            // 排除箭头工具
            if (item.type !== 'arrow') this._onDragElementListener(item.type)
        })

        this.leafer = document.getElementById('leafer') as HTMLDivElement
        this.leafer.addEventListener('dragover', (evt) => {
            evt.preventDefault()
        })

        // 设置目标区域可接收拖拽
        this.leafer&&this.leafer.addEventListener('drop', (evt:DragEvent) => this._onDropLeafer(evt))
        this.editorBoard.app.on(PointerEvent.DOWN, (evt:PointerEvent) => this._onDownPointer(evt))
        this.editorBoard.app.on(PointerEvent.MOVE, (evt:PointerEvent) => this._onMovePointer(evt))
        this.editorBoard.app.on(PointerEvent.UP, (evt:PointerEvent) => this._onUpPointer(evt))
    }

    private _onDownPointer = (_evt:PointerEvent) => {
        console.log('按下了')
        this.isMouseDown = true
    }
    private _onMovePointer = (_evt:PointerEvent) => {
        if (this.isMouseDown) {
            console.log('移动中')
        }
    }
    private _onUpPointer = (_evt:PointerEvent) => {
        console.log('抬起了')
        this.isMouseDown = false
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
            if (type === 'rect') {
                // Box 不设置宽高时，将自适应内容
                const box = new Box({
                    x: point.x,
                    y: point.y,
                    fill: this.options.fill,
                    cornerRadius: 20,
                    textBox: true,
                    hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
                    editable: true,
                    resizeChildren: true, // 同时 resize 文本
                    strokeWidth: 1,
                    stroke: "#32cd79",
                    children: [{
                        tag: 'Text',
                        text: 'Welcome to LeaferJS',
                        fill: this.options.fontColor,
                        fontSize: 16,
                        padding: [10, 20],
                        textAlign: 'left',
                        verticalAlign: 'top'
                    }]
                })
                // 添加图形到画布
                this.editorBoard.app.tree.add(box)
            } else if (type === 'text') {
                const text = new Text({
                    fill: '#333333',
                    placeholder: '请输入文本', // 占位符文本  
                    placeholderColor: 'rgba(120,120,120,0.5)',  // 占位符颜色
                    draggable: true,
                    fontSize: 16,
                    padding: 12,
                    boxStyle: {
                        padding: 12
                    },
                    editable: true,
                    x: point.x,
                    y: point.y
                })
                this.editorBoard.app.tree.add(text)
            }
        }
        e.preventDefault()
    }

    public clear () {
        // 移除监听拖拽元素
        this.toolbars.forEach(item => {
            // 排除箭头工具
            if (item.type !== 'arrow') this._onDragElementRemoveListener(item.type)
        })
        // 移除监听
        this.leafer&&this.leafer.removeEventListener('drop', (evt:DragEvent) => this._onDropLeafer(evt))
        this.editorBoard.app.off(PointerEvent.DOWN, (evt:PointerEvent) => this._onDownPointer(evt))
        this.editorBoard.app.off(PointerEvent.MOVE, (evt:PointerEvent) => this._onMovePointer(evt))
        this.editorBoard.app.off(PointerEvent.UP, (evt:PointerEvent) => this._onUpPointer(evt))
    }
}