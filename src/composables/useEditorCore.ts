import { inject, isRef, type Ref } from "vue";
import type EditorCore from "@/core/EditorCore";
import { CANVAS_CONTEXT_KEY, EDITOR_CORE_KEY } from "@/core/constants/injection-keys";
import type { CanvasContext } from "@/core/CanvasContext";

function resolveCanvasContext(injected: unknown): CanvasContext | null {
    if (!injected) return null;
    if (isRef(injected)) return (injected as Ref<CanvasContext | null>).value;
    return injected as CanvasContext | null;
}

export function useEditorCore(): EditorCore {
    const ctx = resolveCanvasContext(inject(CANVAS_CONTEXT_KEY, null));
    if (ctx) return ctx.editor;

    const injected = inject(EDITOR_CORE_KEY, null);
    if (injected) return injected;

    throw new Error("[Canvas] 请在 EditorCanvas 内使用 useEditorCore()");
}
