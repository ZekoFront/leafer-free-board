import type EditorCore from "@/core/EditorCore";
import {
    CustomEvent,
    SelectEvent,
    SelectMode,
    trackedAttrs,
} from "@/core/constants";
import type { IPluginTempl } from "@/core/types";
import { EditorEvent } from "@leafer-in/editor";
import { isArray, isNull, isObject } from "lodash-es";
import { PropertyEvent, ZoomEvent, type IUI } from "leafer-ui";

const TRACKED_ATTRS = new Set<string>(trackedAttrs);
const ATTR_DEBOUNCE_MS = 300;

interface PendingAttrChange {
    elementId: string;
    oldAttrs: Record<string, unknown>;
    newAttrs: Record<string, unknown>;
    timer: ReturnType<typeof setTimeout>;
}

/**
 * HandlerPlugin — 选择 / 属性变更 / 缩放事件桥接
 */
export class HandlerPlugin implements IPluginTempl {
    static pluginName = "HandlerPlugin";
    static apis = ["getSelectMode"];

    pluginName = HandlerPlugin.pluginName;

    private selectedMode: SelectMode = SelectMode.EMPTY;
    private selectedElements: IUI[] = [];
    private pendingAttrChange: PendingAttrChange | null = null;

    constructor(public editor: EditorCore) {
        this.bind();
    }

    getSelectMode() {
        return this.selectedMode;
    }

    private bind() {
        this.editor.app.editor.on(EditorEvent.SELECT, this.onSelect);
        this.editor.app.tree.on(PropertyEvent.CHANGE, this.onPropertyChange);
        this.editor.app.on(ZoomEvent.ZOOM, this.onZoom);
    }

    private onSelect = (evt: EditorEvent) => {
        this.flushPendingAttrChange();

        if (isArray(evt.value)) {
            this.selectedMode = SelectMode.MULTIPLE;
            this.selectedElements = evt.value;
            this.editor.emit(SelectEvent.MULTIPLE, evt.value);
            return;
        }

        if (isObject(evt.value)) {
            this.selectedMode = SelectMode.SINGLE;
            this.selectedElements = [evt.value as IUI];
            this.editor.emit(SelectEvent.SINGLE, evt.value);
            return;
        }

        if (isNull(evt.value)) {
            this.selectedMode = SelectMode.EMPTY;
            this.selectedElements = [];
            this.editor.emit(SelectEvent.EMPTY, evt.value);
        }
    };

    private onPropertyChange = (evt: PropertyEvent) => {
        if (this.editor.getIsExecuting?.()) return;

        const attrName = (evt as unknown as { attrName?: string }).attrName;
        const oldValue = (evt as unknown as { oldValue?: unknown }).oldValue;
        const newValue = (evt as unknown as { newValue?: unknown }).newValue;
        const target = evt.target as IUI;

        if (!attrName || !TRACKED_ATTRS.has(attrName)) return;

        const elementId = target?.id;
        if (!elementId) return;

        const isSelected = this.selectedElements.some((el) => el.id === elementId);
        if (!isSelected) return;

        if (
            this.pendingAttrChange &&
            this.pendingAttrChange.elementId === elementId
        ) {
            this.pendingAttrChange.newAttrs[attrName] = newValue;
            if (!(attrName in this.pendingAttrChange.oldAttrs)) {
                this.pendingAttrChange.oldAttrs[attrName] = oldValue;
            }
            clearTimeout(this.pendingAttrChange.timer);
            this.pendingAttrChange.timer = setTimeout(
                () => this.flushPendingAttrChange(),
                ATTR_DEBOUNCE_MS,
            );
            return;
        }

        this.flushPendingAttrChange();
        this.pendingAttrChange = {
            elementId,
            oldAttrs: { [attrName]: oldValue },
            newAttrs: { [attrName]: newValue },
            timer: setTimeout(
                () => this.flushPendingAttrChange(),
                ATTR_DEBOUNCE_MS,
            ),
        };
    };

    private flushPendingAttrChange() {
        if (!this.pendingAttrChange) return;

        const { elementId, oldAttrs, newAttrs, timer } = this.pendingAttrChange;
        clearTimeout(timer);
        this.pendingAttrChange = null;

        const hasChanged = Object.keys(newAttrs).some(
            (key) => newAttrs[key] !== oldAttrs[key],
        );
        if (!hasChanged) return;

        this.editor.app.tree.emit("update", {
            batch: [{ id: elementId, undoData: oldAttrs, redoData: newAttrs }],
        });
    }

    private onZoom = (zoom: ZoomEvent) => {
        this.editor.emit(CustomEvent.ZOOM, zoom.totalScale);
    };

    destroy() {
        this.flushPendingAttrChange();
        this.editor.app.editor.off(EditorEvent.SELECT, this.onSelect);
        this.editor.app.tree.off(PropertyEvent.CHANGE, this.onPropertyChange);
        this.editor.app.off(ZoomEvent.ZOOM, this.onZoom);
        this.selectedElements = [];
        this.selectedMode = SelectMode.EMPTY;
    }
}

export default HandlerPlugin;
