import {
    DragEvent,
    LeaferEvent,
    Line,
    Path,
    PropertyEvent,
    ZoomEvent,
    type IUI,
} from "leafer-ui";
import { EditorEvent } from "@leafer-in/editor";
import { cloneDeep, isArray, isEqual, isNull, isObject } from "lodash-es";
import type EditorCore from "@/core/EditorCore";
import {
    CustomEvent,
    SelectEvent,
    SelectMode,
    trackedAttrs,
} from "@/core/constants";
import {
    ExecuteTypeEnum,
    type IMoveData,
    type IPluginTempl,
} from "@/core/types";

const TRACKED_ATTRS = new Set<string>(trackedAttrs);
const ATTR_DEBOUNCE_MS = 300;

/**
 * HandlerPlugin — 核心事件处理插件
 *
 * 监听 Leafer 引擎事件（选择、拖拽、属性变更、缩放），
 * 转换为 EditorCore 上的 SelectEvent / CustomEvent 与历史命令。
 */
export class HandlerPlugin implements IPluginTempl {
    static pluginName = "HandlerPlugin";
    static apis = ["getSelectMode"];

    pluginName = HandlerPlugin.pluginName;
    selectedMode: SelectMode;

    private newSelectedElements: IUI[] = [];
    private dragStartSnapshot = new Map<string, { x: number; y: number }>();
    private lineStartSnapshot = new Map<
        string,
        { points?: number[]; path?: string }
    >();
    private labelStartSnapshot = new Map<string, { x: number; y: number }>();
    private _pendingAttrChange: {
        elementId: string;
        tag: string;
        oldAttrs: Record<string, unknown>;
        newAttrs: Record<string, unknown>;
        timer: ReturnType<typeof setTimeout>;
    } | null = null;

    constructor(public editorCore: EditorCore) {
        this.selectedMode = SelectMode.EMPTY;
        this._listenners();
    }

    private _listenners() {
        const app = this.editorCore.app;
        app.sky.on(LeaferEvent.READY, this._listenSkyReadyEvent);
        app.editor.on(EditorEvent.SELECT, this._listenSelectEvent);
        app.on(DragEvent.START, this._listenDragStartEvent);
        app.on(DragEvent.END, this._listenDragEndEvent);
        app.on(DragEvent.MOVE, this._listenDragMoveEvent);
        app.tree.on(PropertyEvent.CHANGE, this._listenPropertyEvent);
        app.on(ZoomEvent.ZOOM, this._listenZoomEvent);
    }

    private _unlistenners() {
        const app = this.editorCore.app;
        app.sky.off(LeaferEvent.READY, this._listenSkyReadyEvent);
        app.editor.off(EditorEvent.SELECT, this._listenSelectEvent);
        app.off(DragEvent.START, this._listenDragStartEvent);
        app.off(DragEvent.END, this._listenDragEndEvent);
        app.off(DragEvent.MOVE, this._listenDragMoveEvent);
        app.tree.off(PropertyEvent.CHANGE, this._listenPropertyEvent);
        app.off(ZoomEvent.ZOOM, this._listenZoomEvent);
    }

    private _listenZoomEvent = (zoom: ZoomEvent) => {
        this.editorCore.emit(CustomEvent.ZOOM, zoom.totalScale);
    };

    private _listenPropertyEvent = (evt: PropertyEvent) => {
        if (this.editorCore.history.isPerformingAction) return;

        const attrName = (evt as PropertyEvent & { attrName?: string }).attrName;
        const oldValue = (evt as PropertyEvent & { oldValue?: unknown }).oldValue;
        const newValue = (evt as PropertyEvent & { newValue?: unknown }).newValue;
        const target = evt.target as IUI;

        if (!attrName || !TRACKED_ATTRS.has(attrName)) return;

        const elementId = target?.id;
        if (!elementId) return;

        const isSelected = this.newSelectedElements.some((el) => el.id === elementId);
        if (!isSelected) return;

        const tag = (target as IUI & { tag?: string }).tag || "";

        if (
            this._pendingAttrChange &&
            this._pendingAttrChange.elementId === elementId
        ) {
            this._pendingAttrChange.newAttrs[attrName] = newValue;
            if (!(attrName in this._pendingAttrChange.oldAttrs)) {
                this._pendingAttrChange.oldAttrs[attrName] = oldValue;
            }
            clearTimeout(this._pendingAttrChange.timer);
            this._pendingAttrChange.timer = setTimeout(
                () => this._flushPendingAttrChange(),
                ATTR_DEBOUNCE_MS,
            );
        } else {
            this._flushPendingAttrChange();
            this._pendingAttrChange = {
                elementId,
                tag,
                oldAttrs: { [attrName]: oldValue },
                newAttrs: { [attrName]: newValue },
                timer: setTimeout(
                    () => this._flushPendingAttrChange(),
                    ATTR_DEBOUNCE_MS,
                ),
            };
        }
    };

    private _flushPendingAttrChange() {
        if (!this._pendingAttrChange) return;
        const { elementId, tag, oldAttrs, newAttrs, timer } = this._pendingAttrChange;
        clearTimeout(timer);
        this._pendingAttrChange = null;

        const hasChanged = Object.keys(newAttrs).some(
            (key) => newAttrs[key] !== oldAttrs[key],
        );
        if (!hasChanged) return;

        this.editorCore.history.execute({
            executeType: ExecuteTypeEnum.UpdateAttribute,
            elementId,
            oldAttrs,
            newAttrs,
            tag,
        });
    }

    private _listenDragStartEvent = (evt: DragEvent) => {
        if (evt.target.id) {
            this.editorCore.onDragStartElement?.(evt.target);
            this.dragStartSnapshot.set(evt.target.id || "", {
                x: evt.target.x || 0,
                y: evt.target.y || 0,
            });
        } else if (this.newSelectedElements.length) {
            this.newSelectedElements.forEach((el) => {
                if (el.data) {
                    el.data.oldX = el.x;
                    el.data.oldY = el.y;
                    this.dragStartSnapshot.set(el.id || "", {
                        x: el.data.oldX || 0,
                        y: el.data.oldY || 0,
                    });
                }
            });
        }

        this.lineStartSnapshot.clear();
        this.labelStartSnapshot.clear();

        const targets = this.newSelectedElements.length
            ? this.newSelectedElements
            : [evt.target];
        const relatedLines = new Set<IUI>();
        const relatedLabels = new Set<IUI>();

        targets.forEach((target) => {
            const lines =
                this.editorCore.getShapePluginRelatedLines?.(target) ?? [];
            lines.forEach((line: IUI) => relatedLines.add(line));
            const labels =
                this.editorCore.getShapePluginRelatedLabels?.(target) ?? [];
            labels.forEach((label: IUI) => relatedLabels.add(label));
        });

        relatedLines.forEach((line) => {
            if (line?.id) {
                const newLine = line as Line;
                this.lineStartSnapshot.set(line.id, {
                    points: cloneDeep(newLine.points) as number[],
                    path: cloneDeep(newLine.path) as string,
                });
            }
        });

        relatedLabels.forEach((label) => {
            if (label?.id) {
                this.labelStartSnapshot.set(label.id, {
                    x: label.x || 0,
                    y: label.y || 0,
                });
            }
        });
    };

    private _listenDragMoveEvent = (evt: DragEvent) => {
        if (this.newSelectedElements.length === 1) {
            this.editorCore.onDragMoveElement?.(evt);
        }
    };

    private _listenDragEndEvent = () => {
        this.editorCore.onDragEndEvent?.();
        const moveList: IMoveData[] = [];

        if (this.newSelectedElements.length) {
            this.newSelectedElements.forEach((el) => {
                const oldPos = this.dragStartSnapshot.get(el.id || "");
                if (
                    oldPos &&
                    (Math.abs((el.x || 0) - oldPos.x) > 0.01 ||
                        Math.abs((el.y || 0) - oldPos.y) > 0.01)
                ) {
                    moveList.push({
                        id: el.id || "",
                        old: { x: oldPos.x, y: oldPos.y },
                        new: { x: el.x || 0, y: el.y || 0 },
                    });
                }
            });

            if (this.lineStartSnapshot.size > 0) {
                this.lineStartSnapshot.forEach((oldState, lineId) => {
                    const currentLine = this.editorCore.app.tree.findId(lineId);
                    if (!currentLine) return;

                    let hasChanged = false;
                    const newState: Record<string, unknown> = {};
                    const oldStateRecord: Record<string, unknown> = {};

                    if (currentLine.tag === "Line" && oldState.points) {
                        const currentPoints = (currentLine as Line).points;
                        if (!isEqual(currentPoints, oldState.points)) {
                            hasChanged = true;
                            newState.points = currentPoints;
                            oldStateRecord.points = oldState.points;
                        }
                    } else if (currentLine.tag === "Path" && oldState.path) {
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
                            new: newState,
                        });
                    }
                });
                this.lineStartSnapshot.clear();
            }

            if (this.labelStartSnapshot.size > 0) {
                this.labelStartSnapshot.forEach((oldPos, labelId) => {
                    const currentLabel = this.editorCore.app.tree.findId(labelId);
                    if (!currentLabel) return;

                    if (
                        Math.abs((currentLabel.x || 0) - oldPos.x) > 0.01 ||
                        Math.abs((currentLabel.y || 0) - oldPos.y) > 0.01
                    ) {
                        moveList.push({
                            id: labelId,
                            old: { x: oldPos.x, y: oldPos.y },
                            new: {
                                x: currentLabel.x || 0,
                                y: currentLabel.y || 0,
                            },
                        });
                    }
                });
                this.labelStartSnapshot.clear();
            }

            if (moveList.length > 0) {
                this.editorCore.history.execute({
                    executeType: ExecuteTypeEnum.MoveElement,
                    moveList,
                });
            }
        }
    };

    private _listenSkyReadyEvent = () => {
        console.log("编辑器初始化完成");
    };

    private _listenSelectEvent = (evt: EditorEvent) => {
        this._flushPendingAttrChange();
        if (isArray(evt.value)) {
            this.selectedMode = SelectMode.MULTIPLE;
            this.editorCore.emit(SelectEvent.MULTIPLE, evt.value);
            this._setSelect(evt.value);
        } else if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE;
            this.editorCore.emit(SelectEvent.SINGLE, evt.value);
            this._setSelect([evt.value]);
        } else if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY;
            this.editorCore.emit(SelectEvent.EMPTY, evt.value);
        }
    };

    private _setSelect(list: IUI[] = []) {
        this.newSelectedElements = list;
        this.newSelectedElements.forEach((el) => {
            if (el.data) {
                el.data.oldX = el.x;
                el.data.oldY = el.y;
            }
        });
    }

    getSelectMode() {
        return String(this.selectedMode);
    }

    destroy() {
        this._flushPendingAttrChange();
        this.selectedMode = SelectMode.EMPTY;
        this.newSelectedElements = [];
        this.dragStartSnapshot.clear();
        this.lineStartSnapshot.clear();
        this.labelStartSnapshot.clear();
        this._unlistenners();
    }
}

export default HandlerPlugin;
