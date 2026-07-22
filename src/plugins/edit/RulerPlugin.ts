/**
 * RulerPlugin — 标尺与选中遮罩插件
 *
 * 在 sky 层绘制 X/Y 轴标尺，并在选中元素时高亮对应刻度区域。
 *
 * 核心职责：
 * - 在 app.sky 上渲染水平 / 垂直标尺
 * - 监听 SelectEvent，更新选中元素在标尺上的遮罩高亮
 * - 随 zoom / pan 同步更新标尺刻度与位置
 *
 * 依赖：EditorCore.app.sky、SelectEvent
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/RulerPlugin.ts`
 */

export class RulerPlugin {}
