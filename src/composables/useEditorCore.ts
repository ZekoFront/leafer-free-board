/**
 * useEditorCore — 获取编辑器控制器
 *
 * Vue Composable，是 useCanvasContext 的快捷方式，直接返回 EditorCore 实例。
 *
 * 核心职责：
 * - `useEditorCore()` → `useCanvasContext().editor`
 * - 供 ToolBar、ElementAttributes 等 UI 组件替代 props.editor / inject("editorBoard")
 * - 访问插件 API、history、元素 CRUD、事件监听
 *
 * 典型用法：
 * ```ts
 * const editor = useEditorCore();
 * editor.history.undo();
 * editor.use(MyPlugin);
 * editor.on(CustomEvent.CHANGE, handler);
 * ```
 *
 * 依赖：useCanvasContext
 */
