/**
 * CanvasFactory — Leafer App 工厂
 *
 * 根据画板运行模式（edit / render）生成差异化 Leafer App 配置并实例化，
 * 保证编辑模式与渲染模式使用各自最优的引擎参数，且创建逻辑集中可测。
 *
 * 核心职责：
 * - 维护 EDIT_APP_CONFIG / RENDER_APP_CONFIG 两套默认配置
 * - 按 CanvasMode 选择基础配置，合并用户 overrides
 * - 返回配置完毕的 `new App({ view, ...config })`
 *
 * 模式差异（规划）：
 * - edit：启用 editor 手柄、design 树类型、完整编辑 side-effect 插件
 * - render：禁用或隐藏 editor、可选 viewport，不加载编辑 side-effect
 *
 * 对外 API（规划）：
 * - `createApp(view, mode, overrides?) => App`
 */
