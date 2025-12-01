import { Ellipse, Line, Path, PointerEvent, Rect, type IPointData, type IUI, type IUIInputData } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IDrawState, type IPluginTempl, type IPointItem } from "../types";
import { toolbars } from "@/scripts/toolBar";
import { createShape } from "../utils/creatShape";

export class ShapePlugin implements IPluginTempl {
    static pluginName = 'ShapePlugin';
    static apis = ['setToolbarActive', 'onDragEventElement'];
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
    private leafer: HTMLDivElement|undefined
    public startRect:IUIInputData | null = null
    private connections: IUIInputData[] = []
    // 初始化一个空函数作为默认值
    private callBack: (state:IDrawState) => void = () => {}; 
    constructor(public editorBoard: EditorBoard) {
        this._listenners()
    }

    protected setToolbarActive(type: string, callBack:(state?:IDrawState)=>void) {
        this.toolbarActiveType = type
        // 需要手动拖拽绘制的图形
        if (type==='arrow'||type==='line') {
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

    private _onDownPointer = (evt:PointerEvent) => {
        if (this.editorBoard.app.editor&&this.editorBoard.app.cursor === 'crosshair') {
            this.editorBoard.app.editor.target = undefined
            evt.target.draggable = false
            // 绘制箭头
            if (this.toolbarActiveType == 'arrow') {
                const startPoint = evt.getPagePoint()
                this.points.push(startPoint)
                this.element = createShape('arrow', startPoint) as unknown as IUI
            } else if (this.toolbarActiveType == 'line') {
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
        if (this.toolbarActiveType == 'arrow') {
            const arrow = this.element as Arrow
            if (this.points[0]) {
                arrow.points = [this.points[0].x, this.points[0].y, endPoint.x, endPoint.y]
            }
        }
        // 绘制连线
        else if (this.toolbarActiveType == 'line'&&this.element) {
            const line = this.element as Line
            if (this.points[0]) {
                line.points = [this.points[0].x, this.points[0].y, endPoint.x, endPoint.y]
            }
        }
    }
    private _onUpPointer = (_evt:PointerEvent) => {
        if (this.element && this.element.data) {
            this.element.data.executeType = ExecuteTypeEnum.AddElement
            this.editorBoard.history.execute(this.element)
        }
        
        this.editorBoard.app.editor.config.selector = true
        this.editorBoard.app.cursor = 'default'

        // 绘制最终线段，替换虚线
        if (this.toolbarActiveType == 'line'&&this.startRect) {
            const dropResult = this.editorBoard.app.tree.pick({ x: _evt.x, y: _evt.y })
            const endRect = dropResult.target
            if (endRect && endRect !== this.startRect) {
                this._createConnection(this.startRect, endRect as IUIInputData)
            }
            this.element&&this.element.remove()
        }

        this.element = null
        this.startRect = null
        this.isDrawing = false
        this.points = []
        this.callBack({ type: this.toolbarActiveType, state: 'success' })
        this.toolbarActiveType  = ''
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
                shape.data&&(shape.data.executeType = ExecuteTypeEnum.AddElement)
                console.log('生成图形:', shape)
                const res = this.editorBoard.addLeaferElement(shape)
                if (res) {
                    this.editorBoard.history.execute(shape)
                }
            }
        }
        
        e.preventDefault()
    }
    
    private _createConnection(startRect: IUIInputData| null, endRect: IUIInputData) {
        // 计算点和方向
        const { p0, p3 } = this._getBestConnection(startRect || ({} as IUIInputData), endRect)
        // 生成贝塞尔路径数据
        // const pathData = this._getBezierPathString(p0, p3)
        // const path = new Path({
        //     path: pathData,
        //     stroke: '#555',
        //     strokeWidth: 2,
        //     endArrow: 'arrow'
        // })
        // 放到最底层
        // this.editorBoard.app.tree.addAt(path, 0) 
        // 创建直线
        const line = new Line({
            id: this.editorBoard.generateId(),
            editable: true,
            stroke: '#555', strokeWidth: 2, dashPattern: [0, 0],
            points: [p0.x, p0.y, p3.x, p3.y]
        })

        this.editorBoard.addLeaferElement(line)
        this.connections.push({ from: startRect, to: endRect, line: line })

        console.log('计算点和方向:', p0, p3, this.connections)
        return { p0, p3 };
    }

    // 获取两个矩形连接的最近点
    // dirX: 1: 表示“向右走”，控制点会加到当前点的右边，把线拉出去。
    // dirY: -1: 表示“向上走”，控制点会减去 Y 值，把线向上提。
    private _getBestConnection(leaferRectA: IUIInputData, leaferRectB: IUIInputData) {
        const rectA = this._getRectBounds(leaferRectA)
        const rectB = this._getRectBounds(leaferRectB)
        // 计算中心点
        const cxA = (rectA.left || 0) + (rectA.width || 0) / 2;
        const cyA = (rectA.top || 0) + (rectA.height || 0) / 2;
        const cxB = (rectB.left || 0) + (rectB.width || 0) / 2;
        const cyB = (rectB.top || 0) + (rectB.height || 0) / 2;

        const dx = cxB - cxA;
        const dy = cyB - cyA;

        // 结果容器
        let p0:IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 }, p3:IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 };

        // 1. 横向距离 > 纵向距离：左右连接模式
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                // [情况1] B 在 A 右边
                // p0: A的右点 (方向向右: 1, 0)
                // p3: B的左点 (方向向左: -1, 0)
                p0 = { x: rectA.right, y: cyA, dirX: 1,  dirY: 0 };
                p3 = { x: rectB.left || 0, y: cyB, dirX: -1, dirY: 0 };
            } else {
                // [情况2] B 在 A 左边
                // p0: A的左点 (方向向左: -1, 0)
                // p3: B的右点 (方向向右: 1, 0)
                p0 = { x: rectA.left || 0, y: cyA, dirX: -1, dirY: 0 };
                p3 = { x: rectB.right, y: cyB, dirX: 1,  dirY: 0 };
            }
        } 
        // 2. 纵向连接模式
        else {
            if (dy > 0) {
                // [情况3] B 在 A 下面
                // p0: A的下点 (方向向下: 0, 1)
                // p3: B的上点 (方向向上: 0, -1)
                p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
                p3 = { x: cxB, y: rectB.top || 0,    dirX: 0, dirY: -1 };
            } else {
                // [情况4] B 在 A 上面
                // p0: A的上点 (方向向上: 0, -1)
                // p3: B的下点 (方向向下: 0, 1)
                p0 = { x: cxA, y: rectA.top || 0,    dirX: 0, dirY: -1 };
                p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
            }
        }

        return { p0, p3 };
    }

    private _getRectBounds(rect: IUIInputData) {
        return {
            top: rect.y,
            bottom: (rect.y || 0) + (rect.height || 0),
            left: rect.x,
            right: (rect.x || 0) + (rect.width || 0),
            width: rect.width,
            height: rect.height
        }
    }

    private _getBezierPathString(p0: IPointItem, p3: IPointItem) {
        // 动态计算控制力度：距离越远，控制臂越长，曲线越平滑
        const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y);
        const controlDist = Math.min(dist * 0.5, 100); // 限制最大弯曲程度

        // cp1: 起点的控制点 (顺着 dir 方向延伸)
        const cp1 = {
            x: p0.x + p0.dirX * controlDist,
            y: p0.y + p0.dirY * controlDist
        };

        // cp2: 终点的控制点 (顺着 dir 方向延伸)
        const cp2 = {
            x: p3.x + p3.dirX * controlDist,
            y: p3.y + p3.dirY * controlDist
        };

        // 生成 SVG Path 命令: M 起点 C 控制点1 控制点2 终点
        return `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p3.x} ${p3.y}`;
    }

    public onDragEventElement (evt:DragEvent) {
        this._updateRelatedLines(evt)
    }

    private _updateRelatedLines(e:DragEvent) {
        const movingRect = e.target 
        this.connections.forEach(conn => {
            if (conn.from === movingRect || conn.to === movingRect) {
                // 1. 重新计算最佳连接点 (p0, p3 及其方向)
                // const { p0, p3 } = this._getBestConnection(conn.from, conn.to)
                
                // 2. 重新生成 SVG Path 字符串
                // const newPathData = getBezierPathString(p0, p3)
                
                // 3. 更新 Path 属性
                // conn.line.path = newPathData
                // conn.line.points = [p0.x, p0.y, p3.x, p3.y]
            }
        })
    }

    public destroy () {
        this._unListenners()
        this.dragHandlers.clear()
    }
}