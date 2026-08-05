<template>
    <CanvasProvider
        mode="render"
        :plugins="resolvedPlugins"
        :auto-save="false"
        :app-config="resolvedAppConfig"
        class="leafer-render-canvas"
        :style="canvasStyle"
        @ready="onReady"
    >
        <template #default="{ ctx, editor }">
            <slot :ctx="ctx" :editor="editor" />
        </template>

        <template #footer>
            <slot name="footer" />
        </template>
    </CanvasProvider>
</template>

<script setup lang="ts">
import { computed, provide, shallowRef, toRef } from "vue";
import "@leafer-in/viewport";
import "@leafer-in/view";

import type { CanvasContext } from "@/core/CanvasContext";
import type { IAppConfig, ICanvasSnapshot, IPluginClass } from "@/core/types";
import { CANVAS_CONTEXT_KEY } from "@/core/constants/injection-keys";
import CanvasProvider from "@/engine/edit/CanvasProvider.vue";
import { useRenderSnapshot } from "./useRenderSnapshot";

type RenderSnapshotInput = ICanvasSnapshot | ICanvasSnapshot["canvas"];

const props = withDefaults(
    defineProps<{
        snapshot?: RenderSnapshotInput;
        interactive?: boolean;
        fitView?: boolean;
        plugins?: IPluginClass[];
        appConfig?: Partial<IAppConfig>;
        width?: string | number;
        height?: string | number;
    }>(),
    {
        interactive: true,
        fitView: true,
        width: "100%",
        height: "100%",
    },
);

const emit = defineEmits<{
    ready: [ctx: CanvasContext];
}>();

const ctxRef = shallowRef<CanvasContext | null>(null);
provide(CANVAS_CONTEXT_KEY, ctxRef);

const resolvedPlugins = computed(() => props.plugins ?? []);

const resolvedAppConfig = computed<Partial<IAppConfig>>(() => ({
    ...(props.appConfig ?? {}),
    pointer: {
        ...(props.appConfig?.pointer ?? {}),
        preventDefaultMenu: !props.interactive,
    },
    editor: {
        ...(props.appConfig?.editor ?? {}),
        visible: false,
    },
}));

const canvasStyle = computed(() => ({
    width: typeof props.width === "number" ? `${props.width}px` : props.width,
    height: typeof props.height === "number" ? `${props.height}px` : props.height,
    pointerEvents: props.interactive ? "auto" : "none",
}));

useRenderSnapshot({
    ctx: ctxRef,
    snapshot: toRef(props, "snapshot"),
    fitView: toRef(props, "fitView"),
});

function onReady(ctx: CanvasContext) {
    ctxRef.value = ctx;
    emit("ready", ctx);
}
</script>

<style lang="scss">
@use "./render-shell.scss";
</style>
