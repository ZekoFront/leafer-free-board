/**
 * @leafer-free/board — 主入口
 *
 * 对外提供：编辑/渲染画板组件、EditorCore、插件、Composables、类型与工具。
 *
 * 使用方式：
 * ```ts
 * // 全局注册
 * import LeaferBoard from "@leafer-free/board";
 * app.use(LeaferBoard);
 *
 * // 或按需引入
 * import { EditorCanvas } from "@leafer-free/board";
 * ```
 *
 * @see 新架构文档.md §7.2
 */

// ── Vue 插件（全局注册）──────────────────────────────────
export {
    install,
    LeaferBoard,
    LeaferBoardComponents,
} from "./install";
export type {
    LeaferBoardComponentName,
    LeaferBoardInstallOptions,
} from "./install";
export { default } from "./install";

// ── 引擎容器（Vue 组件，可单独 import）──────────────────
export { default as EditorCanvas } from "./engine/edit/EditorCanvas.vue";
export { default as RenderCanvas } from "./engine/render/RenderCanvas.vue";
export { default as CanvasProvider } from "./engine/edit/CanvasProvider.vue";
export { DEFAULT_EDIT_PLUGINS } from "./engine/edit/default-plugins";

// ── Core ───────────────────────────────────────────────
export { CanvasContext } from "./core/CanvasContext";
export { CanvasFactory } from "./core/CanvasFactory";
export { default as EditorCore } from "./core/EditorCore";

// ── 插件（按需 import，便于 tree-shaking）──────────────
export * from "./plugins";

// ── Composables ──────────────────────────────────────────
export { useCanvasContext } from "./composables/useCanvasContext";
export { useEditorCore } from "./composables/useEditorCore";
export { useCanvasSnapshot } from "./composables/useCanvasSnapshot";
export { useCanvasEvents } from "./composables/useCanvasEvents";
export { useHistory } from "./composables/useHistory";

// ── 元素工厂 & 几何 ──────────────────────────────────────
export { createElement, getViewportDropPoint } from "./core/elements";
export {
    getBestConnectionByWorldBoxBounds,
    getRectBounds,
} from "./core/geometry";

// ── 主题 ───────────────────────────────────────────────
export {
    defaultTheme,
    getElementTheme,
    useThemeStore,
} from "./theme";
export type { AppTheme, ElementThemeColors } from "./theme";

// ── 常量 ───────────────────────────────────────────────
export {
    CANVAS_CONTEXT_KEY,
    EDITOR_CORE_KEY,
} from "./core/constants/injection-keys";
export { SelectEvent, SelectMode } from "./core/constants/select-events";
export { CustomEvent } from "./core/constants/custom-events";

// ── 类型 ───────────────────────────────────────────────
export type {
    CanvasMode,
    IAppConfig,
    ICanvasContextOptions,
    ICanvasSnapshot,
    IPluginClass,
    IPluginOption,
    IPluginTempl,
    IDrawState,
    IToolBar,
    IToolBarOption,
    IConnectionPoint,
    IConnectionRecord,
    ISerializedConnection,
    ConnectionKind,
} from "./core/types";

export type { HistoryOp, HistoryStateSnapshot } from "./plugins/history/HistoryPlugin";
