<template>
    <div class="leafer-canvas-provider">
        <div v-if="ready" class="leafer-canvas-provider__header">
            <slot name="header" :ctx="ctx" :editor="editor" />
        </div>

        <div class="leafer-canvas-provider__body">
            <slot v-if="ready" name="before-canvas" :ctx="ctx" :editor="editor" />

            <div
                ref="canvasRef"
                class="leafer-canvas-provider__canvas leafer-canvas-shell"
            >
                <slot v-if="ready" :ctx="ctx" :editor="editor" />
            </div>

            <slot v-if="ready" name="after-canvas" :ctx="ctx" :editor="editor" />
        </div>

        <div v-if="ready" class="leafer-canvas-provider__footer">
            <slot name="footer" :ctx="ctx" :editor="editor" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CanvasContext } from "@/core/CanvasContext";
import type EditorCore from "@/core/EditorCore";
import type { CanvasMode, IAppConfig, IPluginClass } from "@/core/types";
import { useTemplateRef } from "vue";
import { useCanvasLifecycle } from "./useCanvasLifecycle";

const props = withDefaults(
    defineProps<{
        mode?: CanvasMode;
        plugins?: IPluginClass[];
        appConfig?: Partial<IAppConfig>;
        autoSave?: boolean;
        storageKey?: string;
    }>(),
    {
        mode: "edit",
        autoSave: true,
        storageKey: "leafer-editor-canvas-state",
    },
);

const emit = defineEmits<{
    ready: [ctx: CanvasContext];
}>();

const canvasRef = useTemplateRef<HTMLDivElement>("canvasRef");

const { ctx, ready, editor } = useCanvasLifecycle({
    getView: () => canvasRef.value,
    mode: props.mode,
    plugins: props.plugins,
    appConfig: props.appConfig,
    autoSave: props.autoSave,
    storageKey: props.storageKey,
    onReady: (context) => emit("ready", context),
});
</script>

<script lang="ts">
export type CanvasProviderSlots = {
    header?: (props: { ctx: CanvasContext | null; editor: EditorCore }) => unknown;
    default?: (props: { ctx: CanvasContext | null; editor: EditorCore }) => unknown;
    "before-canvas"?: (props: {
        ctx: CanvasContext | null;
        editor: EditorCore;
    }) => unknown;
    "after-canvas"?: (props: {
        ctx: CanvasContext | null;
        editor: EditorCore;
    }) => unknown;
    footer?: (props: { ctx: CanvasContext | null; editor: EditorCore }) => unknown;
};
</script>
