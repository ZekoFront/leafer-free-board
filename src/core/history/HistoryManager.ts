/**
 * HistoryManager — 撤销 / 重做管理器
 *
 * 基于命令模式（Command Pattern）维护 undoStack 与 redoStack，
 * 所有可撤销的画布操作必须经 `execute()` 入栈。
 *
 * 核心职责：
 * - `execute(action)`：按 HistoryAction.executeType 创建 Command 并 execute
 * - `undo()` / `redo()`：弹出栈顶命令，调用 command.undo() / redo()
 * - `clear()` / `destroy()`：清空或释放栈
 * - `saveState()` / `restoreState()`：与 ICanvasSnapshot.history 互转
 * - `state()`：返回 `{ canUndo, canRedo, undoCount, redoCount }` 供 UI 绑定
 * - 变更后 emit `history:change` 通知工具栏更新按钮状态
 *
 * 约束：
 * - maxHistorySize 可配置（默认 50），超出时丢弃最早 undo 记录
 * - 使用 lodash isEqual 避免重复命令入栈
 *
 * 迁移来源：`src/editor/history/HistoryManager.ts`
 */
