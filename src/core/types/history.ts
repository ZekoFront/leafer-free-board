/**
 * types/history — 历史记录 / 命令类型
 *
 * 定义撤销重做系统的命令参数、序列化结构与 execute 判别联合类型。
 *
 * 核心职责：
 * - `HistoryAction`：按 executeType 区分的 execute() 入参联合类型
 * - `ExecuteTypeEnum`：AddElement / DeleteElement / MoveElement / UpdateAttribute / Paste
 * - `ISerializedCommand`：命令入栈后的 JSON 形态，用于 snapshot.history 持久化
 * - `IMoveData` / `IUpdateAttrCommandProps` 等：各命令构造参数
 *
 * 使用场景：
 * - HistoryManager.execute(action) 根据 executeType 实例化对应 Command
 * - EditorCore.saveSnapshot() 将 undo/redo 栈一并序列化
 *
 * 迁移来源：`src/editor/types/history.ts`、`src/editor/types/enums.ts`
 */
