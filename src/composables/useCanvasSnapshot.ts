/**
 * useCanvasSnapshot — 画布快照持久化
 *
 * Vue Composable，封装快照的保存、加载与防抖自动保存，与 UI 存储策略解耦。
 *
 * 核心职责：
 * - `save(storageKey?)`：调用 editor.saveSnapshot() 并写入 localStorage / 自定义后端
 * - `load(storageKey?)`：读取并返回 ICanvasSnapshot，供 CanvasContext.loadSnapshot 使用
 * - `autoSave(options)`：监听 CustomEvent.CHANGE，debounce 后自动 save（替代 useBoardStore）
 * - `clear()`：清除本地缓存
 *
 * 设计原则：
 * - 不持有 App / EditorCore 所有权，仅通过 useEditorCore 读写
 * - 存储介质可配置（默认 localStorage + lz-string 压缩，对齐现有 useBoardStore）
 *
 * 迁移来源：`src/editor/stores/useBoardStore.ts`
 */
