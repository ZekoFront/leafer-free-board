import { inject, isRef, type Ref } from "vue";
import { CANVAS_CONTEXT_KEY } from "@/core/constants/injection-keys";
import type { CanvasContext } from "@/core/CanvasContext";

function resolveCanvasContext(injected: unknown): CanvasContext | null {
    if (!injected) return null;
    if (isRef(injected)) return (injected as Ref<CanvasContext | null>).value;
    return injected as CanvasContext | null;
}

export function useCanvasContext(): CanvasContext {
    const ctx = resolveCanvasContext(inject(CANVAS_CONTEXT_KEY, null));
    if (!ctx) {
        throw new Error("[Canvas] 请在 EditorCanvas / CanvasProvider 子树内使用");
    }
    return ctx;
}
