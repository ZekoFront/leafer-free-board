/**
 * types/snapshot — 画布快照类型
 *
 * 定义可序列化的画布数据结构，是 EditorCanvas 与 RenderCanvas 之间的数据契约。
 *
 * 核心职责：
 * - `ICanvasSnapshot`：完整快照（canvas 元素树 + connections 连线 + history 栈 + version）
 * - 支持 v-model:snapshot 双向绑定与 RenderCanvas props 热更新
 * - `version` 字段用于后续 `migrateSnapshot()` 版本迁移
 *
 * 字段说明（规划）：
 * - canvas: Leafer 元素 JSON 数组（app.tree.toJSON）
 * - connections: 元素间连线序列化数据
 * - history: undoStack / redoStack（渲染模式可忽略）
 * - version / timestamp:  schema 版本与保存时间
 *
 * 迁移来源：`src/editor/types/history.ts` 中的 IBoardSnapshot → ICanvasSnapshot
 */
