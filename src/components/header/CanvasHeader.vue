<template>
    <div class="leafer-free-board--header">
        <HeaderLeft />
        <HeaderCenter />
        <HeaderRight />
    </div>
</template>

<script setup lang="ts">
/**
 * 布局容器，无需 props。
 * 子组件在 setup 中调用 useEditorCore() / useCanvasContext() 即可获取上下文。
 */
import HeaderCenter from "./HeaderCenter.vue";
import HeaderLeft from "./HeaderLeft.vue";
import HeaderRight from "./HeaderRight.vue";
</script>

<style lang="scss" src="./canvas-header.scss"></style>
