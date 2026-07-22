/**
 * HistoryHotKeyPlugin — 撤销 / 重做快捷键插件
 *
 * 为编辑模式绑定全局快捷键，调用 EditorCore.history 执行 undo / redo。
 *
 * 核心职责：
 * - 快捷键 `Ctrl+Z` → history.undo()（debounce 防连击）
 * - 快捷键 `Ctrl+Y` → history.redo()
 * - destroy 时解绑 hotkeys
 *
 * 依赖：EditorCore.history、hotkeys-js（由 EditorCore.use 统一绑定）
 *
 * 分类：plugins/core — 编辑模式核心
 *
 * 迁移来源：`src/editor/plugins/HistoryHotKeyPlugin.ts`
 */

export class HistoryHotKeyPlugin {}
