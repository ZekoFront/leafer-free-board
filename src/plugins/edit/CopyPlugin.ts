/**
 * CopyPlugin — 复制 / 粘贴插件
 *
 * 监听选择事件，支持将选中元素复制到剪贴板并粘贴为新元素。
 *
 * 核心职责：
 * - 快捷键 `Ctrl+C`：序列化当前选中元素到内部 clipboard
 * - 快捷键 `Ctrl+V`：克隆元素、偏移位置、execute PasteCommand
 * - 依赖 HandlerPlugin 的 SelectEvent 获取选中列表
 *
 * 依赖：EditorCore.history、SelectEvent
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/CopyPlugin.ts`
 */

export class CopyPlugin {}
