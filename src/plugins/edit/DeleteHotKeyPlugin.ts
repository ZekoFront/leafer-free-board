/**
 * DeleteHotKeyPlugin — 删除快捷键插件
 *
 * 监听选中状态，通过快捷键删除当前选中的画布元素。
 *
 * 核心职责：
 * - 快捷键 `Backspace` / `Delete`：删除 editor.app.editor.list 选中项
 * - execute DeleteCommand，支持撤销
 * - 无选中时不执行
 *
 * 依赖：EditorCore.history、@leafer-in/editor 选中列表
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/DeleteHotKeyPlugin.ts`
 */

export class DeleteHotKeyPlugin {}
