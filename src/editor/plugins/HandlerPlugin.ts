import { SelectEvent, SelectMode } from "@/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import { LeaferEvent, DragEvent, type ILeaf, type IUI } from "leafer-ui";
import { EditorEvent } from "leafer-editor";
import { cloneDeep, isArray, isNull, isObject } from "lodash-es";
import type { IMoveData } from "../history/interface/ICommand";

class HandlerPlugin implements IPluginTempl {
    static pluginName = 'HandlerPlugin';
    static apis = ['getSelectMode'];
    public selectedMode: SelectMode;
    public dragElement: ILeaf| null = null;
    private newSelectedElements: IUI[] = []
    private oldSelectedElements: IUI[] = []
    
    constructor(public editorBoard: EditorBoard) {
        this.selectedMode = SelectMode.EMPTY
        this._listenners()
    }
    private dragStartSnapshot: Map<string, { x: number, y: number }> = new Map();
    private _listenners() {
        this.editorBoard.app.sky.on(LeaferEvent.READY, this._listenSkyReadyEvent)
        this.editorBoard.app.editor.on(EditorEvent.SELECT, this._listenSelectEvent)
        // DragEvent拖拽事件监听
        this.editorBoard.app.on(DragEvent.START, this._listenDragStartEvent)
        this.editorBoard.app.on(DragEvent.END, this._listenDragEndEvent)
        this.editorBoard.app.on(DragEvent.MOVE, this._listenDragMoveEvent)
    }

    private _unlistenners() {
        this.editorBoard.app.sky.off(LeaferEvent.READY, this._listenSkyReadyEvent)
        this.editorBoard.app.editor.off(EditorEvent.SELECT, this._listenSelectEvent)
        this.editorBoard.app.off(DragEvent.START, this._listenDragStartEvent)
        this.editorBoard.app.off(DragEvent.END, this._listenDragEndEvent)
        this.editorBoard.app.off(DragEvent.MOVE, this._listenDragMoveEvent)
    }

    private _listenDragStartEvent = (evt:DragEvent) => {
        if (evt.target.id) {
            this.editorBoard.onDragStartElement(evt.target)
            // 注意：拷贝的数据引用地址变化了，用===比较时永远是false
            this.dragElement = cloneDeep(evt.target)
            this.dragStartSnapshot.set(this.dragElement.id || '', { x: this.dragElement.x || 0, y: this.dragElement.y || 0 });
        } else  {
            // 多选开始拖拽
           if (this.oldSelectedElements&&this.oldSelectedElements.length) {
                this.oldSelectedElements.forEach(node => {
                    this.dragStartSnapshot.set(node.id || '', { x: node.x || 0, y: node.y || 0 });
                });
            }
        }
    }

    private _listenDragMoveEvent = (evt:DragEvent) => {
        if (!this.dragElement) return
        this.editorBoard.onDragMoveElement(evt)
        // console.log('移动事件:', this.dragElement)
    }

    private _listenDragEndEvent = (evt:DragEvent) => {
        // if (!this.dragElement) return
        const moveList: IMoveData[] = [];
        // 根据选中元素个数来实现不同的拖拽历史记录
        if (this.selectedMode === SelectMode.MULTIPLE) {
            if (this.newSelectedElements.length === 0) return
            // 获取批量新坐标
            this.newSelectedElements.forEach(el => {
                const oldPos = this.dragStartSnapshot.get(el.id || '');
                if (oldPos && (Math.abs((el.x || 0) - oldPos.x) > 0.01 || Math.abs((el.y || 0) - oldPos.y) > 0.01)) {
                    moveList.push({
                        id: el.id || '',
                        old: { x: oldPos.x, y: oldPos.y },
                        new: { x: el.x || 0, y: el.y || 0 }
                    });
                }
            });

            // 添加操作记录
            if (moveList.length > 0) {
                this.editorBoard.history.execute({
                    data: {
                        executeType: ExecuteTypeEnum.MoveElement,
                        moveList: moveList
                    }
                })
            }
        } else {
            if (this.dragElement) {
                const oldPos = this.dragStartSnapshot.get(this.dragElement.id || '');
                const { x: x1, y: y1 } = evt.target;
                if (oldPos && (Math.abs((x1 || 0) - oldPos.x) > 0.01 || Math.abs((y1 || 0) - oldPos.y) > 0.01)) {
                    moveList.push({
                        id: this.dragElement.id || '',
                        old: { x: oldPos.x, y: oldPos.y },
                        new: { x: x1 || 0, y: y1 || 0 }
                    });
                }
                if (moveList.length > 0) {
                    this.editorBoard.history.execute({
                        data: {
                            executeType: ExecuteTypeEnum.MoveElement,
                            moveList: moveList
                        }
                    })
                }
            }
            
        }
        this.dragElement = null
    }

    // evt: LeaferEvent
    private _listenSkyReadyEvent = () => {
        console.log('编辑器初始化完成') 
    }

    private _listenSelectEvent = (evt: EditorEvent) => {
        this.newSelectedElements = evt.value as IUI[];
        this.oldSelectedElements = cloneDeep(evt.value) as IUI[];
        if (isArray(evt.value)) {
            this.selectedMode = SelectMode.MULTIPLE
            this.editorBoard.emit(SelectEvent.MULTIPLE, evt.editor.target)
        } else if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE
            this.editorBoard.emit(SelectEvent.SINGLE, evt.editor.target)
        } else if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY
            this.editorBoard.emit(SelectEvent.EMPTY, evt.editor.target)
        }
    }

    protected getSelectMode() {
        return String(this.selectedMode);
    }

    public destroy () {
        this.selectedMode = SelectMode.EMPTY;
        this.dragElement = {} as ILeaf;
        this.newSelectedElements = [];
        this.oldSelectedElements = [];
        this.dragStartSnapshot.clear();
        this._unlistenners()
    }
}

export default HandlerPlugin