/**
 * CanvasContext — 画板实例上下文
 *
 * 每个 EditorCanvas / RenderCanvas 组件对应唯一一个 CanvasContext，
 * 作为该画板实例的「对象域」，统一管理 Leafer App 与 EditorCore 的生命周期。
 *
 * 核心职责：
 * - 通过 CanvasFactory 创建并持有 Leafer `App` 实例（全局单 App，禁止 elsewhere new App）
 * - 创建并初始化 `EditorCore`，绑定 app
 * - 按 CanvasMode（edit | render）区分运行模式
 * - 提供插件注册入口 `use(plugin)`，转发至 EditorCore
 * - 提供快照读写 `saveSnapshot()` / `loadSnapshot()`，供编辑导出与渲染预览
 * - 统一销毁：`destroy()` 释放 editor、插件与 app
 *
 * 依赖关系：
 * - CanvasFactory → 创建 App
 * - EditorCore → 业务逻辑门面
 *
 * 对外 API（规划）：
 * - `constructor({ view, mode, appConfig? })`
 * - `use(plugin, options?)` / `loadSnapshot()` / `saveSnapshot()` / `destroy()`
 */
