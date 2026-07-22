/**
 * ShapePlugin — 图形创建与连线插件
 *
 * 根据工具栏当前工具类型，支持拖拽创建基础图形与指针绘制元素间连线。
 *
 * 核心职责：
 * - 拖拽创建：矩形、圆形、椭圆、菱形、文本等（createElement + history AddCommand）
 * - 指针绘制：直线连线、曲线连线、箭头（@leafer-in/arrow）
 * - 维护 connections 映射，供 saveSnapshot 序列化
 * - 暴露 API：`restoreConnections()` / `getSerializableConnections()`（供 EditorCore 快照）
 * - 监听工具切换（IDrawState），切换 pointer / drag 模式
 *
 * 依赖：EditorCore、creatElement 工具、ExecuteTypeEnum.AddElement
 *
 * 分类：plugins/edit — EditorCanvas 默认加载
 *
 * 迁移来源：`src/editor/plugins/ShapePlugin.ts`
 */

export class ShapePlugin {}
