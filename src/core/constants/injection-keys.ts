/**
 * injection-keys — Vue 依赖注入键
 *
 * 集中定义 Canvas 相关 provide/inject 的 Symbol 键，避免魔法字符串散落各组件。
 *
 * 核心职责：
 * - 导出 `CANVAS_CONTEXT_KEY`：CanvasProvider provide，子组件 inject 获取 CanvasContext
 * - 后续可扩展：`EDITOR_CORE_KEY` 等（通常通过 useEditorCore 间接获取即可）
 *
 * 使用方式：
 * - Provider：`provide(CANVAS_CONTEXT_KEY, ctx)`
 * - Consumer：`inject(CANVAS_CONTEXT_KEY)` 或 `useCanvasContext()`
 */
