/**
 * EditorCore — 编辑器控制器
 *
 * 由现有 `src/editor/EditorBoard.ts` 迁移并重命名，是整个画板的业务门面，
 * 与 Vue / DOM 无关，可被 CanvasContext 与插件直接依赖。
 *
 * 核心职责：
 * - 插件系统：`use(plugin)` 注册、冲突检测、快捷键绑定、API 代理到实例
 * - 元素 CRUD：`addLeaferElement` / `removeLeaferElement` / `getById`
 * - 历史记录：持有 HistoryManager，所有可撤销操作走 `history.execute()`
 * - 快照序列化：`saveSnapshot()` / `loadSnapshot()`（原 saveBoard / loadBoard）
 * - 事件总线：继承 EventEmitter，分发 history:change、CustomEvent 等
 * - 生命周期：`init(app)` 绑定引擎，`destroy()` 级联销毁插件与 app
 *
 * 依赖关系：
 * - HistoryManager → 撤销/重做
 * - HandlerPlugin → 编辑模式默认加载的核心事件处理
 *
 * 对外 API（规划）：
 * - `init(app)` / `use(plugin)` / `history` / `saveSnapshot()` / `loadSnapshot()` / `destroy()`
 */
