/**
 * types/index — 核心类型统一导出
 *
 * 作为 `@/core/types` 的 barrel 入口，对外暴露 Canvas 域所有 TypeScript 类型与枚举，
 * 供 EditorCore、插件、Composables、Vue 组件共享，避免循环引用。
 *
 * 核心职责：
 * - 重导出 snapshot / plugin / history / context 等子模块类型
 * - npm 包构建时作为 `export type { ... } from "./core/types"` 的来源
 *
 * 规划导出：
 * - ICanvasSnapshot, CanvasMode, IPluginTempl, HistoryAction, ExecuteTypeEnum 等
 */
