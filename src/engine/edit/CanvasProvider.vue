<template>
    <div class="leafer-canvas-provider">
        <div v-if="ready" class="leafer-canvas-provider__header">
            <slot name="header" :ctx="ctx" :editor="editor" />
        </div>

        <div class="leafer-canvas-provider__body">
            <!-- 左侧：更多元素面板（可拖拽 / 点击添加到画布） -->
            <ElementPalette v-if="ready" />

            <div
                ref="canvasRef"
                class="leafer-canvas-provider__canvas leafer-canvas-shell"
            >
                <!-- 右侧：选中元素属性面板 -->
                <ElementAttributes v-if="ready" />
            </div>
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
import ElementAttributes from "@/components/ElementAttributes.vue";
import ElementPalette from "@/components/ElementPalette.vue";

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
    footer?: (props: { ctx: CanvasContext | null; editor: EditorCore }) => unknown;
};
</script>
