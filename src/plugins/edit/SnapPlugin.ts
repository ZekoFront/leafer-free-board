/**
 * SnapPlugin — 智能吸附对齐插件
 *
 * 基于 leafer-x-easy-snap，在拖拽与缩放时提供元素间对齐辅助线。
 *
 * 核心职责：
 * - 初始化 Snap(editor.app) 并 enable(true)
 * - 拖拽过程中显示对齐参考线与吸附行为
 * - destroy 时释放 snap 实例
 *
 * 依赖：leafer-x-easy-snap、EditorCore.app
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/SnapPlugin.ts`
 */

export class SnapPlugin {}
