/**
 * history/commands — 历史命令实现
 *
 * 各 Command 类实现 ICommand 接口，封装单次可撤销操作的正向与逆向逻辑。
 *
 * 核心职责：
 * - BaseCommand：公共字段（id、elementId、tag、desc）与 compress/decompress
 * - AddCommand：添加元素 ↔ 删除元素
 * - DeleteCommand：删除元素 ↔ 恢复元素
 * - MoveCommand：移动/多选移动 ↔ 还原坐标
 * - UpdateAttrCommand：属性变更 ↔ 还原旧属性
 * - PasteCommand：粘贴 ↔ 删除粘贴产物
 *
 * 每个命令需提供：
 * - `execute()`：执行变更并写入 Leafer tree
 * - `undo()` / `redo()`：对称回滚
 * - `compress()` / `decompress()`：可选，用于历史栈内存优化
 *
 * 迁移来源：`src/editor/history/commands/` 目录下各文件，合并或保持子目录均可
 */
