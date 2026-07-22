/**
 * useCanvasContext — 获取画板实例上下文
 *
 * Vue Composable，从 CanvasProvider 注入的 CANVAS_CONTEXT_KEY 读取 CanvasContext。
 *
 * 核心职责：
 * - `useCanvasContext()`：返回当前画板实例的 CanvasContext（含 app、editor、mode）
 * - 在 EditorCanvas / RenderCanvas 子树内任意组件、Composable 中调用
 * - 未在 Provider 内使用时抛出明确错误，便于调试
 *
 * 典型用法：
 * ```ts
 * const ctx = useCanvasContext();
 * ctx.app.tree.findId('xxx');
 * ctx.loadSnapshot(data);
 * ```
 *
 * 依赖：@/core/constants/injection-keys 中的 CANVAS_CONTEXT_KEY
 */
