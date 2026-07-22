<template>
    <div class="leafer-editor-canvas">
        <!-- 规划：header（ToolBar）+ CanvasProvider(edit) + ElementAttributes -->
        <slot />
    </div>
</template>

<script setup lang="ts">
/**
 * EditorCanvas — 可编辑画板引擎容器（对外）
 *
 * engine/edit 对外主组件，组合工具栏、画布、属性面板，
 * 内部 CanvasMode 固定为 "edit"。
 *
 * 核心职责：
 * - 装配 DEFAULT_EDIT_PLUGINS + 用户传入 plugins
 * - v-model:snapshot 双向绑定 ICanvasSnapshot
 * - autoSave + storageKey 防抖持久化（useCanvasSnapshot）
 * - 渲染 ToolBar、HeaderLeft/Right、ElementAttributes（或 slot 覆盖）
 * - 事件：ready(ctx)、change、history:change
 *
 * Props（规划）：
 * - snapshot / plugins / autoSave / storageKey / appConfig
 *
 * Slots：toolbar-left、toolbar-right、attributes
 *
 * 依赖：CanvasProvider、useCanvasLifecycle、components/toolbar、components/attributes
 *
 * 迁移来源：`src/editor/board.vue` + `src/App.vue` 中的 LeaferFreeBoard
 */
</script>

<style lang="scss">
@use "./editor-shell.scss";
</style>
