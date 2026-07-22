/**
 * types/plugin — 插件系统类型
 *
 * 定义插件契约接口，EditorCore.use() 据此校验并实例化插件。
 *
 * 核心职责：
 * - `IPluginTempl`：插件实例模板（pluginName、apis、hotkeys、events、destroy）
 * - `IPluginClass`：插件类构造函数签名 `new (editor: EditorCore, options?)`
 * - `IPluginOption`：插件可选配置项
 *
 * 插件静态字段约定：
 * - pluginName：唯一标识，防重复注册
 * - apis[]：方法名列表，自动代理到 EditorCore 实例
 * - hotkeys[]：快捷键，由 EditorCore 通过 hotkeys-js 绑定
 * - events[]：自定义事件名，注册前做冲突检测
 *
 * 迁移来源：`src/editor/types/plugin.ts`（IEditorBoard → EditorCore）
 */
