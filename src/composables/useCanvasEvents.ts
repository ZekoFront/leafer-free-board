import { onBeforeUnmount } from "vue";
import { CustomEvent } from "@/core/constants/custom-events";
import { useEditorCore } from "./useEditorCore";
import type { HistoryState } from "./useHistory";

export interface CanvasEventHandlers {
    onChange?: (state?: HistoryState) => void;
    onZoom?: (scale: number) => void;
}

/**
 * 画布事件订阅 — 组件卸载时自动解绑
 */
export function useCanvasEvents(handlers: CanvasEventHandlers = {}) {
    const editor = useEditorCore();
    const { onChange, onZoom } = handlers;

    if (onChange) {
        editor.on(CustomEvent.CHANGE, onChange);
    }
    if (onZoom) {
        editor.on(CustomEvent.ZOOM, onZoom);
    }

    onBeforeUnmount(() => {
        if (onChange) {
            editor.off(CustomEvent.CHANGE, onChange);
        }
        if (onZoom) {
            editor.off(CustomEvent.ZOOM, onZoom);
        }
    });
}
