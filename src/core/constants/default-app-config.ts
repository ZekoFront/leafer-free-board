/**
 * default-app-config — Leafer App 默认配置
 *
 * 存放编辑模式与渲染模式的 Leafer App 初始化参数，供 CanvasFactory 合并使用。
 *
 * 核心职责：
 * - `EDIT_APP_CONFIG`：编辑画板默认项（ground、tree.type=design、editor 手柄、sky 层等）
 * - `RENDER_APP_CONFIG`：渲染画板默认项（无 editor 或 editor.visible=false、只读交互等）
 * - 与 `src/editor/board.vue` 现有 App 配置对齐，迁移时以此为单一数据源
 *
 * 对外导出（规划）：
 * - `EDIT_APP_CONFIG` / `RENDER_APP_CONFIG` / `mergeAppConfig(base, overrides)`
 */
