<template>
    <div class="right header-right">
        <div class="header-right-zoom">
            <NIcon size="16" class="cursor" title="缩小" @click="zoomOut">
                <ZoomOutIcon />
            </NIcon>
            <span
                class="zoom-percentage cursor"
                title="重置"
                @click="zoomReset"
                >{{ percentage }}</span
            >
            <NIcon size="16" class="cursor" title="放大" @click="zoomIn">
                <ZoomInIcon />
            </NIcon>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Decimal } from "decimal.js";
import { EditorBoard } from "@/editor";
import { ZoomInIcon, ZoomOutIcon } from "@/assets/icons";
import {
    MIN_ZOOM,
    MAX_ZOOM,
    DEFAULT_STEP_ZOOM,
    DEFAULT_ZOOM,
    CustomEvent,
} from "@/editor/utils";

const { editor } = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard,
    },
});

const zoom = ref(DEFAULT_ZOOM);

const percentage = computed(() => `${(zoom.value * 100).toFixed(0)}%`);

const zoomOut = () => {
    const newZoom = new Decimal(zoom.value).sub(DEFAULT_STEP_ZOOM).toNumber();
    zoom.value = Math.max(MIN_ZOOM, newZoom);
    editor.app.zoom(zoom.value);
};

const zoomIn = () => {
    const newZoom = new Decimal(zoom.value).add(DEFAULT_STEP_ZOOM).toNumber();
    zoom.value = Math.min(MAX_ZOOM, newZoom);
    editor.app.zoom(zoom.value);
};

// 重置缩放
const zoomReset = () => {
    zoom.value = 1;
    editor.app.zoom(zoom.value);
};

const setZoom = (zoomValue: number) => {
    zoom.value = zoomValue;
}

onMounted(() => {
    editor.on(CustomEvent.ZOOM, setZoom)
})
onBeforeUnmount(() => {
    editor.off(CustomEvent.ZOOM, setZoom)
})
</script>

<style scoped lang="scss">
.header-right {
    display: flex;
    justify-content: flex-end;
    height: 100%;
    &-zoom {
        display: flex;
        align-items: center;
        border-radius: 0.5rem;
        padding: 4px;
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.04);
        .zoom-percentage {
            padding: 0 3px;
            display: inline-block;
            flex-shrink: 0;
            flex: 0 0 46px;
            text-align: center;
        }
        .n-icon {
            padding: 0 6px;
        }
    }
}
</style>
sc
