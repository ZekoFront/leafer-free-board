import { debounce } from "lodash-es";
import { CanvasContext } from "@/core/CanvasContext";
import { CustomEvent } from "@/core/constants";
import { CANVAS_CONTEXT_KEY, EDITOR_CORE_KEY } from "@/core/constants/injection-keys";
import EditorCore from "@/core/EditorCore";
import type { CanvasMode, IAppConfig, IPluginClass } from "@/core/types";
import { useCanvasSnapshot } from "@/composables/useCanvasSnapshot";
import { DEFAULT_EDIT_PLUGINS } from "@/engine/edit/default-plugins";

export interface UseCanvasLifecycleOptions {
    getView: () => HTMLElement | null | undefined;
    mode?: CanvasMode;
    plugins?: readonly IPluginClass[];
    appConfig?: Partial<IAppConfig>;
    autoSave?: boolean;
    storageKey?: string;
    onReady?: (ctx: CanvasContext) => void;
}

export function useCanvasLifecycle(options: UseCanvasLifecycleOptions) {
    const editor = new EditorCore();
    const ctxRef = shallowRef<CanvasContext | null>(null);
    const ready = ref(false);

    provide(CANVAS_CONTEXT_KEY, ctxRef);
    provide(EDITOR_CORE_KEY, editor);

    const snapshotStore = useCanvasSnapshot(options.storageKey);
    let autoSaveDebounced: ReturnType<typeof debounce> | null = null;
    let autoSaveHandler: (() => void) | null = null;

    onMounted(async () => {
        await nextTick();
        const view = options.getView();
        if (!view) {
            console.error("[CanvasLifecycle] canvas view 未就绪");
            return;
        }

        const ctx = new CanvasContext({
            view,
            mode: options.mode ?? "edit",
            appConfig: options.appConfig,
            editor,
        });

        const plugins = options.plugins ?? DEFAULT_EDIT_PLUGINS;
        plugins.forEach((plugin) => ctx.use(plugin));

        if (options.autoSave !== false) {
            autoSaveDebounced = debounce(() => {
                try {
                    snapshotStore.persist(ctx.saveSnapshot());
                } catch (err) {
                    console.error("[CanvasLifecycle] 自动保存失败:", err);
                }
            }, 1000);
            autoSaveHandler = () => autoSaveDebounced?.();
            ctx.editor.on(CustomEvent.CHANGE, autoSaveHandler);
        }

        const snapshot = await snapshotStore.load();
        if (snapshot?.canvas?.length) {
            ctx.loadSnapshot(snapshot);
        }

        ctxRef.value = ctx;
        ready.value = true;
        options.onReady?.(ctx);
    });

    onBeforeUnmount(() => {
        autoSaveDebounced?.cancel();
        if (ctxRef.value && autoSaveHandler) {
            ctxRef.value.editor.off(CustomEvent.CHANGE, autoSaveHandler);
        }
        ctxRef.value?.destroy();
        ctxRef.value = null;
        ready.value = false;
    });

    return { ctx: ctxRef, ready, editor };
}
