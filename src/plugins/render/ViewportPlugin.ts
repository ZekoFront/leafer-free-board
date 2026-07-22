/**
 * ViewportPlugin — 渲染模式视口插件
 *
 * 供 RenderCanvas 使用，在只读预览场景下提供平移、缩放等轻量交互，
 * 不依赖 @leafer-in/editor 编辑模块。
 *
 * 核心职责：
 * - 基于 @leafer-in/viewport 或 @leafer-in/view 配置只读视口
 * - 支持 props.interactive 开关：关闭时禁止 pan / zoom
 * - 支持 fitView：挂载后自动缩放至内容包围盒
 * - 不注册 history、不监听 Select / Drag 编辑事件
 *
 * 依赖：EditorCore.app（render 模式下的 CanvasContext）
 *
 * 分类：plugins/render — RenderCanvas 可选加载
 *
 * 规划：新实现；现有 editor 目录无对应文件
 */

export class ViewportPlugin {}
