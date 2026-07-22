/**
 * useCanvasLifecycle — 画板引擎生命周期
 *
 * 封装 CanvasContext 的创建、插件装配、快照加载与销毁，
 * 供 CanvasProvider 或 EditorCanvas / RenderCanvas 复用。
 *
 * 核心职责：
 * - `setupLifecycle(options)`：onMounted 创建 CanvasContext，onBeforeUnmount destroy
 * - 按 mode 注册 plugins，edit 模式加载 DEFAULT_EDIT_PLUGINS
 * - 初始 snapshot：props.snapshot 或 localStorage（useCanvasSnapshot）
 * - emit ready(ctx) / 绑定 autoSave（编辑容器）
 *
 * 参数（规划）：
 * - view: Ref<HTMLElement | null>
 * - mode: CanvasMode
 * - plugins?: IPluginTempl[]
 * - snapshot?: ICanvasSnapshot
 * - onReady?: (ctx: CanvasContext) => void
 *
 * 依赖：CanvasContext、useCanvasSnapshot、default-plugins（edit）
 *
 * 迁移来源：`src/editor/board.vue` onMounted / onBeforeUnmount 逻辑
 */

export function useCanvasLifecycle() {}
