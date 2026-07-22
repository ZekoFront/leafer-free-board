<template>
    <div class="leafer-render-canvas">
        <!-- 规划：CanvasProvider(render) + 可选 slot -->
        <slot />
    </div>
</template>

<script setup lang="ts">
/**
 * RenderCanvas — 渲染 / 预览画板引擎容器（对外）
 *
 * engine/render 对外主组件，通过 props.snapshot 驱动只读预览，
 * 内部 CanvasMode 固定为 "render"。
 *
 * 核心职责：
 * - props.snapshot 传入 ICanvasSnapshot 或 canvas[]，watch 热更新 loadSnapshot
 * - 不加载 @leafer-in/editor，不注册 Shape / Copy / Delete 等编辑插件
 * - 可选 ViewportPlugin：interactive、fitView
 * - 不渲染 ToolBar / ElementAttributes（除非 slot 自定义）
 * - 不写入 history，不 autoSave
 *
 * Props（规划）：
 * - snapshot、interactive、fitView、plugins、appConfig、width、height
 *
 * 依赖：CanvasProvider、useRenderSnapshot、RENDER_APP_CONFIG
 *
 * 规划：新实现；预览页、嵌入文档、缩略图等场景
 */
</script>

<style lang="scss">
@use "./render-shell.scss";
</style>
