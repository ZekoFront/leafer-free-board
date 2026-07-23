<template>
    <div style="height: calc(100vh - 5px); width: 100%">
        <EditorCanvas @ready="onReady" />
    </div>
</template>

<script setup lang="ts">
import type { CanvasContext } from "@/core/CanvasContext";
import EditorCanvas from "@/engine/edit/EditorCanvas.vue";

function onReady(ctx: CanvasContext) {
    console.log("[Playground] EditorCanvas ready", ctx);
}
</script>
