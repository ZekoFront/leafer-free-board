---
name: leafer-board-dev
description: >-
  Develop leafer-free-board (@leafer-free/board): EditorCore, plugins, elements,
  connections, snapshots, element palette. Use when working on this repo's canvas
  editor, Leafer integration, 新架构, plugins, ConnectionPlugin, HistoryPlugin,
  or element library features.
---

# Leafer Free Board 开发

## 快速定位

| 需求 | 路径 |
|------|------|
| 架构说明 | `新架构文档.md` |
| 编辑器核心 | `src/core/EditorCore.ts` |
| 默认插件 | `src/engine/edit/default-plugins.ts` |
| 元素工厂 | `src/core/elements/createElement.ts` |
| 左侧面板 | `src/config/element-palette.ts` |
| 连线拓扑 | `src/plugins/edit/ConnectionPlugin.ts` |
| 绘制交互 | `src/plugins/edit/ShapePlugin.ts` |
| 撤销重做 | `src/plugins/history/HistoryPlugin.ts` |
| 主题 | `src/theme/` + `src/store/useThemeStore.ts` |

## 开发检查清单

```
- [ ] 新逻辑在 src/core 或 src/plugins，非 src/editor
- [ ] 插件已 export 并加入 DEFAULT_EDIT_PLUGINS（顺序正确）
- [ ] 元素有 id、可 draggable、已加入 element-palette
- [ ] 连线：Polygon/Star 走 polygonConnection 轮廓锚点
- [ ] 快照含 canvas + connections（loadSnapshot 可 rebuild）
- [ ] npm run build 验证（旧 editor 目录 TS 警告可忽略）
```

## 快照结构

```typescript
interface ICanvasSnapshot {
  canvas: IUIInputData[];
  connections?: ISerializedConnection[];
  history?: HistoryStateSnapshot;
  version: number;
  timestamp: number;
}
```

## 详细文档

见 [reference.md](reference.md)
