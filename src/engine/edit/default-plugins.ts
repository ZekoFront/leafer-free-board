/**
 * default-plugins — 编辑画板默认插件列表
 *
 * EditorCanvas 挂载时按序 use() 的插件集合，
 * 与 plugins/edit、plugins/core 目录对应。
 *
 * 核心职责：
 * - 导出 `DEFAULT_EDIT_PLUGINS` 常量数组
 * - 顺序：Handler → Snap → Ruler → ScrollBar → DotMatrix → Delete → Copy → HistoryHotKey → Shape
 * - 消费方可 `:plugins="[...DEFAULT_EDIT_PLUGINS, MyPlugin]"` 扩展或覆盖
 *
 * 注意：
 * - HandlerPlugin 也可由 EditorCore.init 自动加载，此处显式列出便于 tree-shaking 配置
 * - RenderCanvas 不使用本列表
 *
 * 依赖：@/plugins 各 Plugin 类
 */

// 规划实现示例：
// import { HandlerPlugin, SnapPlugin, ... } from "@/plugins";
// export const DEFAULT_EDIT_PLUGINS = [HandlerPlugin, SnapPlugin, ...] as const;

export const DEFAULT_EDIT_PLUGINS = [] as const;
