/**
 * ScrollBarPlugin — 滚动条插件
 *
 * 基于 @leafer-in/scroll，为画布提供可拖拽的横向 / 纵向滚动条。
 *
 * 核心职责：
 * - 初始化 ScrollBar 并绑定 app 视口
 * - 大画布平移时同步滚动条 thumb 位置
 * - destroy 时移除滚动条 DOM / 监听
 *
 * 依赖：@leafer-in/scroll、EditorCore.app
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/ScrollBarPlugin.ts`
 */

export class ScrollBarPlugin {}
