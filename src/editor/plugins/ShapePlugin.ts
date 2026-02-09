import { Line, Path, PointerEvent, type IPointData, type IUI, type IUIInputData } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import { isEqual, throttle } from 'lodash-es'
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IDrawState, type IPluginTempl } from "../types";
import { toolbars, createElement, getBezierPathString, getBestConnectionByWorldBoxBounds } from "../utils";
import { EditorRotateEvent, EditorScaleEvent } from "@leafer-in/editor";

export class ShapePlugin implements IPluginTempl {
    static pluginName = 'ShapePlugin';
    static apis = ['setToolbarActive', 'onDragMoveElement', 'onDragStartElement','onDragEndEvent', 'getShapePluginRelatedLines'];
    static hotkeys: string[]= [];
    static events = ['testEvent'];
    public toolbars = toolbars;
    private drawMode = '';
    private excludeTypes = ['select','arrow'];
    private element: IUIInputData | null = null
    private points: IPointData[] = []
    private dragHandlers: Map<string, (e: DragEvent) => void> = new Map();
    private isDrawing = false
    private draggingNode: IUIInputData | null = null
    // 处理拖拽生成图形
    private leafer: HTMLDivElement|undefined
    public startRect:IUIInputData | null = null
    private connections: IUIInputData[] = []
    // 初始化一个空函数作为默认值
    private callBack: (state:IDrawState) => void = () => {}; 
    constructor(public editorBoard: EditorBoard) {
        this._listenners()
    }

    protected setToolbarActive(type: string, callBack:(state?:IDrawState)=>void) {
        this.drawMode = type
        this.editorBoard.cancelSelected()
        // 需要手动拖拽绘制的图形
        if (['arrow', 'line', 'curve'].includes(type)) {
            this.editorBoard.app.cursor = 'crosshair'
            this.editorBoard.app.editor.config.selector = false
        } else {
            this.editorBoard.app.cursor = 'pointer'
            this.editorBoard.app.editor.config.selector = true
        }
        this.callBack = callBack
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
        this.editorBoard.app.editor.on(EditorScaleEvent.SCALE, this._onTransformEvent)
        this.editorBoard.app.editor.on(EditorRotateEvent.ROTATE, this._onTransformEvent)
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
        this.editorBoard.app.editor.off(EditorScaleEvent.SCALE, this._onTransformEvent)
        this.editorBoard.app.editor.off(EditorRotateEvent.ROTATE, this._onTransformEvent)
    }

    // 创建节流版本的更新函数
    private _updateRelatedLinesThrottled = throttle((target: IUIInputData[]) => {
        if (target.length === 0) return
        target.forEach(item => {
            this._updateRelatedLines(item);
        });
    }, 16, { leading: true, trailing: true });

    // 当元素发生缩放或旋转时触发
    private _onTransformEvent = () => {
        // 获取当前编辑器选中的所有元素列表
        this._updateRelatedLinesThrottled(this.editorBoard.app.editor.list);
    }

    private _tempElement (evt:PointerEvent) {
        // 绘制连线，允许有id的元素进行连线
        if (evt.target&&evt.target.id) {
            this.startRect = evt.target as IUIInputData
            this.startRect.x
            const centerPoint: IPointData = { x: (this.startRect.x || 0) + (this.startRect.width || 0) / 2, y: (this.startRect.y || 0) + (this.startRect.height || 0) / 2 }
            this.points.push(centerPoint)
            this.element = new Line({
                id: this.editorBoard.generateId(),
                stroke: '#555', strokeWidth: 2, dashPattern: [4, 4],
                points: [centerPoint.x, centerPoint.y, evt.x, evt.y],
                hittable: false // 让这条线无法被点击/拾取
            })
        }
    }

    private _onDownPointer = (evt:PointerEvent) => {
        if (this.editorBoard.app.editor&&this.editorBoard.app.cursor === 'crosshair') {
            this.editorBoard.app.editor.target = undefined
            evt.target.draggable = false
            // 绘制箭头
            if (this.drawMode == 'arrow') {
                // 按下鼠标拖动开始画线，抬起结束，当缩放平移视图后，仍然可以准确绘制新的线条
                // 转换事件为 page 坐标 = evt.getPagePoint()
                // @see https://www.leaferjs.com/ui/guide/advanced/coordinate.html
                const startPoint = evt.getPagePoint()
                this.points.push(startPoint)
                this.element = createElement('arrow', startPoint) as unknown as IUI
            } 
            // 绘制直线
            else if (this.drawMode == 'line') {
                this._tempElement(evt)
            } 
            // 绘制曲线
            else if (this.drawMode == 'curve') {
                this._tempElement(evt)
            }
        }
    }
    private _onMovePointer = (_evt:PointerEvent) => {
        if (!this.element) return 
        if (this.editorBoard.app && !this.isDrawing) {
            this.editorBoard.addLeaferElement(this.element)
            // 进入绘制状态
            this.isDrawing = true
        }
        const endPoint = _evt.getPagePoint()
        // 绘制箭头
        if (this.drawMode == 'arrow') {
            const arrow = this.element as Arrow
            if (this.points[0]) {
                arrow.points = [this.points[0].x, this.points[0].y, endPoint.x, endPoint.y]
            }
        }
        // 绘制临时连线
        else if (['line', 'curve'].includes(this.drawMode)&&this.element) {
            const line = this.element as Line
            if (this.points[0]) {
                line.points = [this.points[0].x, this.points[0].y, endPoint.x, endPoint.y]
            }
        }
    }
    private _onUpPointer = (_evt:PointerEvent) => {
        this.editorBoard.app.editor.config.selector = true
        this.editorBoard.app.cursor = 'default'

        // 绘制最终线段，替换虚线
        if (['line', 'curve'].includes(this.drawMode)&&this.startRect) {
            const dropResult = this.editorBoard.app.tree.pick({ x: _evt.x, y: _evt.y })
            const endRect = dropResult.target
            if (endRect) {
                // 兼容分组元素连线
                const group = endRect.parent
                if (group?.tag === 'Group' && group !== this.startRect) {
                    this._createConnection(this.startRect, group as IUIInputData)
                } else if (endRect !== this.startRect){
                    this._createConnection(this.startRect, endRect as IUIInputData)
                }
            }
           
            // 删除辅助线
            this.element&&this.element.remove()
        }

        // 绘制普通箭头元素
        else if (this.drawMode == 'arrow' && this.element && this.element.data) {
            this.element.data.executeType = ExecuteTypeEnum.AddElement
            this.editorBoard.history.execute(this.element)
        }

        this.element = null
        this.startRect = null
        this.isDrawing = false
        this.points = []
        this.callBack({ type: this.drawMode, state: 'success' })
        this.drawMode = ''
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
            const shape = createElement(type, point)
            if (shape) {
                shape.data&&(shape.data.executeType = ExecuteTypeEnum.AddElement)
                // console.log('生成图形:', shape)
                const res = this.editorBoard.addLeaferElement(shape)
                res && this.editorBoard.history.execute(shape)
            }
        }
        
        e.preventDefault()
    }
    
    private _createConnection(startRect: IUIInputData| null, endRect: IUIInputData) {
        // 计算点和方向
        const { p0, p3 } = getBestConnectionByWorldBoxBounds(startRect || ({} as IUIInputData), endRect)
        let line: IUI|null = null;
        if (this.drawMode == 'curve') {
            // 生成贝塞尔路径数据
            const pathData = getBezierPathString(p0, p3)
            line = new Path({
                path: pathData,
                stroke: '#555',
                strokeWidth: 2,
                editable: true,
                draggable: false,
                // endArrow: 'arrow' // 箭头
            })
            // 放到最底层
            // this.editorBoard.app.tree.addAt(path, 0) 
        } else if (this.drawMode == 'line') {
            // 创建连接箭头直线
            line = new Line({
                editable: true,
                stroke: '#555', strokeWidth: 2, dashPattern: [0, 0],
                points: [p0.x, p0.y, p3.x, p3.y],
                draggable: false,
                endArrow: 'arrow' // 箭头
            })
        }

        if (line) {
            line.data && (line.data.executeType = ExecuteTypeEnum.AddElement)
            // 添加元素到画布
            this.editorBoard.addLeaferElement(line)
            // 添加历史记录
            this.editorBoard.history.execute(line)
            this.connections.push({ from: startRect, to: endRect, line: line })
        }
    }

    // 拖拽开始选中元素
    public onDragStartElement (ele: IUIInputData) {
        this.draggingNode = ele
    }

    // 拖拽移动更新相关连接线
    public onDragMoveElement () {
        // 绘制模式下不触发更新
        if (this.drawMode || !this.draggingNode) return
        if (this.connections.length === 0) return
        this._updateRelatedLinesThrottled([this.draggingNode]);
    }

    public onDragEndEvent () {
        this.draggingNode = null
    }

    // 更新相关连接线
    private _updateRelatedLines(movingRect:IUIInputData) {
        this.connections.forEach(conn => {
            if (isEqual(conn.from, movingRect) || isEqual(conn.to, movingRect)) {
                // 重新计算最佳连接点 (p0, p3 及其方向)
                const { p0, p3 } = getBestConnectionByWorldBoxBounds(conn.from, conn.to)
                if (conn.line.tag == 'Path') {
                    // 更新曲线
                    const newPathData = getBezierPathString(p0, p3)
                    conn.line.path = newPathData
                } else if (conn.line.tag == 'Line') {
                    // 更新直线
                    conn.line.points = [p0.x, p0.y, p3.x, p3.y]
                }
            }
        })
    }

    // 暴露给 HandlerPlugin 使用，获取某个元素关联的所有线条
    public getShapePluginRelatedLines(node: IUIInputData): IUI[] {
        // 过滤出与 node 相关的连接 (from 或 to 是 node)
        // 并返回其中的 line 对象
        return this.connections
            .filter(conn => isEqual(conn.from, node) || isEqual(conn.to, node))
            .map(conn => conn.line as IUI);
    }

    public destroy () {
        this._unListenners()
        this.dragHandlers.clear()
        this.connections.length = 0
        // 防止组件销毁后，还有一个挂起的 throttle 回调试图去更新已经不存在的图形
        this._updateRelatedLinesThrottled.cancel();
    }
}