import { SelectEvent, SelectMode } from "@/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import { LeaferEvent, DragEvent, type IUI, Line, Path } from "leafer-ui";
import { EditorEvent } from "leafer-editor";
import { cloneDeep, isArray, isEqual, isNull, isObject } from "lodash-es";
import type { IMoveData } from "../types";

class HandlerPlugin implements IPluginTempl {
    static pluginName = 'HandlerPlugin';
    static apis = ['getSelectMode'];
    public selectedMode: SelectMode;
    private newSelectedElements: IUI[] = []
    // Key: 线条ID, Value: 线条的关键属性 (points 或 path)
    private lineStartSnapshot: Map<string, { points?: number[], path?: string }> = new Map();
    
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

        // 清空旧快照
        this.lineStartSnapshot.clear();

        // 收集所有被拖拽元素关联的线条
        const targets = this.newSelectedElements.length ? this.newSelectedElements : [evt.target];
        // 使用 Set 去重
        const relatedLines = new Set<IUI>(); 

        targets.forEach(target => {
            const lines = this.editorBoard.getShapePluginRelatedLines(target)
            lines.forEach((line: IUI) => relatedLines.add(line))
        })

        // 记录线条初始状态
        relatedLines.forEach(line => {
            // 存在id才添加
            if (line && line.id) {
                const newLine:Line = line as Line;
                this.lineStartSnapshot.set(line.id, {
                    // 注意：数组必须深拷贝 [...array]，否则引用变了历史记录也跟着变
                    points: cloneDeep(newLine.points) as number[],
                    path: cloneDeep(newLine.path) as string
                })
            }
        })
    }

    private _listenDragMoveEvent = (evt:DragEvent) => {
        // 单个拖拽元素触发
        if (this.newSelectedElements.length === 1) {
            this.editorBoard.onDragMoveElement(evt)
        }
    }

    private _listenDragEndEvent = () => {
        this.editorBoard.onDragEndEvent()
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

            // 检查关联线条变化
            if (this.lineStartSnapshot.size > 0) {
                this.lineStartSnapshot.forEach((oldState, lineId) => {
                    const currentLine = this.editorBoard.app.tree.findId(lineId);
                    if (!currentLine) return;

                    let hasChanged = false;
                    const newState: any = {};
                    const oldStateRecord: any = {};

                    // 检查 Line (points 变化)
                    if (currentLine.tag === 'Line' && oldState.points) {
                        const currentPoints = (currentLine as Line).points;
                        // 简单对比数组长度或内容 (这里用 JSON.stringify 简单判断)
                        if (!isEqual(currentPoints, oldState.points)) {
                            hasChanged = true;
                            newState.points = currentPoints; // 引用当前的新 points
                            oldStateRecord.points = oldState.points; // 之前的旧 points
                        }
                    } 
                    // 检查 Path (path 字符串变化)
                    else if (currentLine.tag === 'Path' && oldState.path) {
                        const currentPath = (currentLine as Path).path;
                        if (currentPath !== oldState.path) {
                            hasChanged = true;
                            newState.path = currentPath;
                            oldStateRecord.path = oldState.path;
                        }
                    }

                    if (hasChanged) {
                        moveList.push({
                            id: lineId,
                            old: oldStateRecord,
                            new: newState
                        });
                    }
                })

                // 清理快照
                this.lineStartSnapshot.clear();
            }

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