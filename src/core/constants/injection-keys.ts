import type { InjectionKey, ShallowRef } from "vue";
import type { CanvasContext } from "../CanvasContext";
import type EditorCore from "../EditorCore";

/** setup 阶段 provide，onMounted 后赋值 */
export const CANVAS_CONTEXT_KEY: InjectionKey<ShallowRef<CanvasContext | null>> =
    Symbol("CanvasContext");

/** EditorCore 实例 inject key（CanvasProvider 内 provide） */
export const EDITOR_CORE_KEY: InjectionKey<EditorCore> = Symbol("EditorCore");
