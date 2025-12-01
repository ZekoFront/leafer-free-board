import { SelectEvent, SelectMode } from "@/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import { LeaferEvent, DragEvent, type ILeaf } from "leafer-ui";
import { EditorEvent } from "leafer-editor";
import { cloneDeep, isArray, isNull, isObject } from "lodash-es";

class HandlerPlugin implements IPluginTempl {
    static pluginName = 'HandlerPlugin';
    static apis = ['getSelectMode'];
    static hotkeys: string[]= [];
    public selectedMode: SelectMode;
    public dragElement: ILeaf | ILeaf[] | null = null;
    
    constructor(public editorBoard: EditorBoard) {
        this.selectedMode = SelectMode.EMPTY
        this._listenners()
    }

    private _listenners() {
        this.editorBoard.app.sky.on(LeaferEvent.READY, () => this._listenSkyReadyEvent())
        this.editorBoard.app.editor.on(EditorEvent.SELECT, (evt: EditorEvent) => this._listenSelectEvent(evt))
        // DragEvent拖拽事件监听
        this.editorBoard.app.on(DragEvent.START, (evt: DragEvent) => this._listenDragStartEvent(evt))
        this.editorBoard.app.on(DragEvent.END, (evt: DragEvent) => this._listenDragEndEvent(evt))
        this.editorBoard.app.on(DragEvent.MOVE, (evt: DragEvent) => this._listenDragMoveEvent(evt))
    }

    private _listenDragStartEvent (evt:DragEvent) {
        if (evt.target.id) {
            this.dragElement = cloneDeep(evt.target)
            console.log('拖拽元素:', this.dragElement)
        } else  {
            // const { x, y} = evt.target
            // console.log('拖拽箭头:', { x, y })
        }
    }

    private _listenDragMoveEvent (evt:DragEvent) {
        if (!this.dragElement) return
        this.editorBoard.onDragEventElement(this.dragElement)
        // console.log('移动事件:', this.dragElement)
    }

    private _listenDragEndEvent (evt:DragEvent) {
        if (!this.dragElement) return
        // 根据选中元素个数来实现不同的拖拽历史记录
        if (this.selectedMode === SelectMode.MULTIPLE) {
            // 批量拖拽待实现
        } else {
            // 单个拖拽
            const { x, y, id, tag } = this.dragElement as ILeaf
            const { x: x1, y: y1 } = evt.target
            if (!x || !y) return

            this.editorBoard.history.execute({
                data: {
                    executeType: ExecuteTypeEnum.MoveElement,
                    elementId: id,
                    oldXYValue: { x, y },
                    newXYValue: { x: x1, y: y1 }
                }, 
                tag
            })
        }
        this.dragElement = null
    }

    // evt: LeaferEvent
    private _listenSkyReadyEvent() {
        console.log('编辑器初始化完成') 
    }

    private _listenSelectEvent(evt: EditorEvent) {
        if (isArray(evt.value)) {
            // console.log('多选：', evt.value)
            this.selectedMode = SelectMode.MULTIPLE
            this.editorBoard.emit(SelectEvent.MULTIPLE, evt.editor.target)
        } else if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE
            this.editorBoard.emit(SelectEvent.SINGLE, evt.editor.target)
            // console.log('单选：', evt.value)
        } else if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY
            this.editorBoard.emit(SelectEvent.EMPTY, evt.editor.target)
            // console.log('取消', evt)
        }
    }

    protected getSelectMode() {
        return String(this.selectedMode);
    }

    public destroy () {
        this.selectedMode = SelectMode.EMPTY;
        this.dragElement = {} as ILeaf;
    }
}

export default HandlerPlugin