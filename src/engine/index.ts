/**
 * engine/index — 画板引擎容器统一导出
 *
 * npm 包对外暴露 EditorCanvas / RenderCanvas 的源入口，
 * 对应 `@leafer-free/board`、`@leafer-free/board/editor`、`@leafer-free/board/render`。
 *
 * 核心职责：
 * - 导出 `EditorCanvas`（engine/edit）— 可编辑画板容器
 * - 导出 `RenderCanvas`（engine/render）— 渲染 / 预览画板容器
 * - shared 内部组件（CanvasProvider、CanvasShell）通常不直接对外导出
 *
 * 目录分层：
 * - engine/shared — Context 创建、DOM 挂载、生命周期
 * - engine/edit   — 编辑容器 + 默认插件 + 编辑区样式
 * - engine/render   — 预览容器 + snapshot 热更新 + 渲染区样式
 */

export { default as EditorCanvas } from "./edit/EditorCanvas.vue";
export { default as RenderCanvas } from "./render/RenderCanvas.vue";
