<template>
    <div ref="canvasRef" class="leafer-canvas-shell" />
</template>

<script setup lang="ts">
/**
 * CanvasShell — Leafer 挂载 DOM 容器
 *
 * 仅负责提供 Leafer App 的 view  HTMLElement，不包含业务逻辑。
 *
 * 核心职责：
 * - 渲染 `<div ref="canvasRef" class="leafer-canvas-shell" />`
 * - 通过 defineExpose 暴露 canvasRef 供 CanvasProvider / useCanvasLifecycle 使用
 * - 样式由 editor-shell.scss / render-shell.scss 或 tokens 控制尺寸与背景
 *
 * 约束：
 * - 不在此组件内 new App()，DOM 就绪后交给 CanvasContext
 *
 * 迁移来源：`src/editor/board.vue` 中的 `#leafer` / `.leafer-free-board--body`
 */

const canvasRef = useTemplateRef<HTMLDivElement>("canvasRef");

defineExpose({ canvasRef });
</script>
