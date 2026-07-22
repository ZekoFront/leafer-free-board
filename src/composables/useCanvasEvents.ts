/**
 * useCanvasEvents — 画布事件订阅
 *
 * Vue Composable，封装 EditorCore EventEmitter 与 CustomEvent 的类型安全订阅，
 * 在组件 onBeforeUnmount 时自动 off，避免泄漏。
 *
 * 核心职责：
 * - `onCanvasEvent(event, handler)`：监听 CustomEvent（CHANGE、ZOOM、SELECT 等）
 * - `onHistoryChange(handler)`：监听 history:change，更新撤销/重做按钮
 * - 内部使用 onScopeDispose / onBeforeUnmount 自动解绑
 *
 * 典型用法：
 * ```ts
 * useCanvasEvents({
 *   onChange: () => refreshPreview(),
 *   onHistoryChange: (state) => { canUndo.value = state.canUndo; },
 * });
 * ```
 *
 * 依赖：useEditorCore、@/editor/utils 中的 CustomEvent 枚举（迁移后移至 core/constants）
 */
