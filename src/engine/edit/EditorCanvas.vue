<template>
    <CanvasProvider
        mode="edit"
        :plugins="resolvedPlugins"
        :auto-save="autoSave"
        :storage-key="storageKey"
        :app-config="appConfig"
        class="leafer-editor-canvas"
        @ready="onReady"
    >
        <template #header>
            <slot name="header">
                <CanvasHeader />
            </slot>
        </template>

        <template #footer>
            <slot name="footer" />
        </template>
    </CanvasProvider>
</template>

<script setup lang="ts">
import { version } from "leafer-ui";
import { computed, provide, shallowRef } from "vue";
import "@leafer-in/editor";
import "@leafer-in/viewport";
import "@leafer-in/text-editor";
import "@leafer-in/find";
import "@leafer-in/export";
import "@leafer-in/view";

import "@/bridge/proxyData";

import type { CanvasContext } from "@/core/CanvasContext";
import type { IAppConfig, IPluginClass } from "@/core/types";
import { CANVAS_CONTEXT_KEY } from "@/core/constants/injection-keys";
import CanvasProvider from "./CanvasProvider.vue";
import { DEFAULT_EDIT_PLUGINS } from "./default-plugins";
import CanvasHeader from "@/components/header/CanvasHeader.vue";

const props = withDefaults(
    defineProps<{
        plugins?: IPluginClass[];
        autoSave?: boolean;
        storageKey?: string;
        appConfig?: Partial<IAppConfig>;
    }>(),
    {
        autoSave: true,
        storageKey: "leafer-editor-canvas-state",
    },
);

const emit = defineEmits<{
    ready: [ctx: CanvasContext];
}>();

// slot 内容在 EditorCanvas 作用域 inject，需在此 re-provide
const ctxRef = shallowRef<CanvasContext | null>(null);
provide(CANVAS_CONTEXT_KEY, ctxRef);

const resolvedPlugins = computed(() =>
    props.plugins ? [...props.plugins] : [...DEFAULT_EDIT_PLUGINS],
);

function onReady(ctx: CanvasContext) {
    ctxRef.value = ctx;
    emit("ready", ctx);
}

console.log("leaferjs:", version);
</script>

<style lang="scss">
@use "./editor-shell.scss";
</style>
