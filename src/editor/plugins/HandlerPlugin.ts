import { SelectEvent, SelectMode } from "@/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import { LeaferEvent, DragEvent, type IUI } from "leafer-ui";
import { EditorEvent } from "leafer-editor";
import { isArray, isNull, isObject } from "lodash-es";
import type { IMoveData } from "../types";

class HandlerPlugin implements IPluginTempl {
    static pluginName = 'HandlerPlugin';
    static apis = ['getSelectMode'];
    public selectedMode: SelectMode;
    private newSelectedElements: IUI[] = []
    
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
        // 单个拖拽元素触发
        if (evt.target.id) {
            this.editorBoard.onDragStartElement(evt.target)
            this.dragStartSnapshot.set(evt.target.id || '', { x: evt.target.x || 0, y: evt.target.y || 0 });
        }
        // 多选开始拖拽
        else if (this.newSelectedElements&&this.newSelectedElements.length) {
            // 初始化起始坐标
            this.newSelectedElements.forEach(el => {
                if (el.data) {
                    el.data.oldX = el.x
                    el.data.oldY = el.y
                    this.dragStartSnapshot.set(el.id || '', { x: el.data.oldX || 0, y: el.data.oldY || 0 });
                }
            })
        }
    }

    private _listenDragMoveEvent = (evt:DragEvent) => {
        // 单个拖拽元素触发
        if (this.newSelectedElements.length === 1) {
            this.editorBoard.onDragMoveElement(evt)
        }
    }

    private _listenDragEndEvent = () => {
        const moveList: IMoveData[] = [];
        if (this.newSelectedElements.length) {
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
        }
    }

    // evt: LeaferEvent
    private _listenSkyReadyEvent = () => {
        console.log('编辑器初始化完成') 
    }

    private _listenSelectEvent = (evt: EditorEvent) => {
        if (isArray(evt.value)) {
            this.selectedMode = SelectMode.MULTIPLE
            this.editorBoard.emit(SelectEvent.MULTIPLE, evt.value)
            this._setSelect(evt.value)
        } else if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE
            this.editorBoard.emit(SelectEvent.SINGLE, evt.value)
            this._setSelect([evt.value])
        } else if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY
            this.editorBoard.emit(SelectEvent.EMPTY, evt.value)
        }
    }

    private _setSelect (list:IUI[] = []) {
        this.newSelectedElements = list
        // 初始化起始坐标，每次拖拽时都有不同的旧坐标
        this.newSelectedElements.forEach(el => {
            if (el.data) {
                el.data.oldX = el.x
                el.data.oldY = el.y
            }
        })
    }

    protected getSelectMode() {
        return String(this.selectedMode);
    }

    public destroy () {
        this.selectedMode = SelectMode.EMPTY;
        this.newSelectedElements = [];
        this.dragStartSnapshot.clear();
        this._unlistenners()
    }
}

export default HandlerPlugin