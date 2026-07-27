import type EditorCore from "@/core/EditorCore";
import {
    CustomEvent,
    SelectEvent,
    SelectMode,
    trackedAttrs,
} from "@/core/constants";
import type { IPluginTempl } from "@/core/types";
import { EditorEvent, EditorRotateEvent, EditorScaleEvent } from "@leafer-in/editor";
import { isArray, isNull, isObject } from "lodash-es";
import { DragEvent, PropertyEvent, ZoomEvent, type IUI } from "leafer-ui";

const TRACKED_ATTRS = new Set<string>(trackedAttrs);
const ATTR_DEBOUNCE_MS = 300;

interface PendingAttrChange {
    elementId: string;
    oldAttrs: Record<string, unknown>;
    newAttrs: Record<string, unknown>;
    timer: ReturnType<typeof setTimeout>;
}

/**
 * HandlerPlugin — 选择 / 属性变更 / 缩放 / 拖拽事件桥接
 *
 * 拖拽移动时驱动 ConnectionPlugin 实时更新关联连线的四边端点。
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
        const app = this.editor.app;
        app.editor.on(EditorEvent.SELECT, this.onSelect);
        app.tree.on(PropertyEvent.CHANGE, this.onPropertyChange);
        app.on(ZoomEvent.ZOOM, this.onZoom);
        // 拖拽过程中实时刷新连线（HistoryPlugin 在 END 时入栈）
        app.on(DragEvent.MOVE, this.onDragMove);
        app.editor.on(EditorScaleEvent.SCALE, this.onTransform);
        app.editor.on(EditorRotateEvent.ROTATE, this.onTransform);
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

    /** 拖拽移动：更新被拖节点及选中项的关联连线 */
    private onDragMove = (evt: DragEvent) => {
        const nodeIds = new Set<string>();
        const target = evt.target as IUI;
        if (target?.id) nodeIds.add(target.id);
        for (const el of this.selectedElements) {
            if (el.id) nodeIds.add(el.id);
        }
        nodeIds.forEach((id) => {
            this.editor.updateConnectionsForNode?.(id);
        });
    };

    /** 缩放/旋转选中元素后重算连线 */
    private onTransform = () => {
        for (const el of this.selectedElements) {
            if (el.id) this.editor.updateConnectionsForNode?.(el.id);
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

        // 连线标签文本变更 → 刷新白底/透明背景
        if (attrName === "text" && this.editor.isConnectionLabel?.(target)) {
            this.editor.syncConnectionLabelBackground?.(target);
        }

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
        const app = this.editor.app;
        app.editor.off(EditorEvent.SELECT, this.onSelect);
        app.tree.off(PropertyEvent.CHANGE, this.onPropertyChange);
        app.off(ZoomEvent.ZOOM, this.onZoom);
        app.off(DragEvent.MOVE, this.onDragMove);
        app.editor.off(EditorScaleEvent.SCALE, this.onTransform);
        app.editor.off(EditorRotateEvent.ROTATE, this.onTransform);
        this.selectedElements = [];
        this.selectedMode = SelectMode.EMPTY;
    }
}

export default HandlerPlugin;
