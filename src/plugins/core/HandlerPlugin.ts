/**
 * HandlerPlugin — 核心事件处理插件
 *
 * 编辑模式默认由 EditorCore 自动加载，负责监听 Leafer 引擎事件并
 * 转换为可撤销的历史命令与 CustomEvent 业务事件。
 *
 * 核心职责：
 * - 监听 EditorEvent.SELECT，维护 SelectMode（EMPTY / SINGLE / MULTIPLE）
 * - 监听 DragEvent START / MOVE / END，记录移动快照并 execute MoveCommand
 * - 监听 PropertyEvent.CHANGE，debounce 后 execute UpdateAttrCommand
 * - 监听 ZoomEvent，emit CustomEvent.ZOOM
 * - 连线跟随：元素移动/缩放/旋转时更新 Line / Path 与标签位置
 * - 暴露 API：`getSelectMode()`
 *
 * 依赖：EditorCore、HistoryManager、CustomEvent / SelectEvent 枚举
 *
 * 分类：plugins/core — 编辑模式核心，不可省略
 *
 * 迁移来源：`src/editor/plugins/HandlerPlugin.ts`
 */

export class HandlerPlugin {}
