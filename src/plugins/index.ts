/**
 * plugins/index — 插件统一导出入口
 *
 * npm 包 `@leafer-free/board/plugins` 子路径的源文件，
 * 按 core / edit / render 三类导出所有可注入插件类。
 *
 * 核心职责：
 * - 导出 core 插件：HandlerPlugin、HistoryHotKeyPlugin（编辑模式必需）
 * - 导出 edit 插件：Shape、Copy、Delete、Snap、Ruler、ScrollBar、DotMatrix
 * - 导出 render 插件：ViewportPlugin（预览模式可选）
 * - 供 EditorCanvas 默认装配与消费方按需 tree-shaking import
 *
 * 使用方式：
 * ```ts
 * import { SnapPlugin, ShapePlugin } from "@/plugins";
 * editor.use(SnapPlugin);
 * ```
 *
 * 迁移来源：`src/editor/plugins/index.ts`
 */

export * from "./core/HandlerPlugin";
export * from "./core/HistoryHotKeyPlugin";

export * from "./edit/ShapePlugin";
export * from "./edit/CopyPlugin";
export * from "./edit/DeleteHotKeyPlugin";
export * from "./edit/SnapPlugin";
export * from "./edit/RulerPlugin";
export * from "./edit/ScrollBarPlugin";
export * from "./edit/DotMatrixPlugin";

export * from "./render/ViewportPlugin";

export * from "./history/HistoryPlugin";
