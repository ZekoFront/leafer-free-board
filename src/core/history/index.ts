/**
 * history/index — 历史记录模块入口
 *
 * 统一导出 HistoryManager 与各 Command 类，供 EditorCore 与插件引用。
 *
 * 核心职责：
 * - 导出 `HistoryManager` 类
 * - 导出 AddCommand / DeleteCommand / MoveCommand / UpdateAttrCommand / PasteCommand 等
 * - 导出 ICommand 接口（若独立文件则从此 re-export）
 *
 * 迁移来源：`src/editor/history/index.ts`
 */
