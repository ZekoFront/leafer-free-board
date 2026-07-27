# 架构参考摘要

完整文档：`新架构文档.md`

## 四层分离

1. **Core** — EditorCore、CanvasContext、元素/几何/类型
2. **Plugins** — 可注入能力，经 `editor.use(PluginClass)`
3. **Engine** — Vue 容器，provide CanvasContext
4. **Components** — 工具栏、属性面板、元素库

## 插件 API 代理

`static apis = ["addConnection"]` → 运行时 `editor.addConnection(...)` 转发到插件实例。

## ConnectionPlugin 关键 API

- `addConnection(from, to, line, label)`
- `removeConnectionsForNode(nodeId)`
- `updateConnectionsForNode(nodeId)` — 节点移动/缩放后重算
- `exportConnections` / `importConnections` / `rebuildConnectionsFromCanvas`

## HistoryPlugin

- 监听 `ChildEvent.ADD/REMOVE`、`DragEvent` 批量 UPDATE
- `runWithoutRecording` 用于预览线、加载快照
- `getRelatedLines` 委托 ConnectionPlugin

## ShapePlugin 绘制模式

- 拖拽放置：`DRAGGABLE_TYPES` + drop `type`
- arrow：两点自由线段
- line/curve：元素 A → B 四边连线
- paintbrush：Pen + DragEvent
- `setToolbarActive` 进入绘制模式时 `editor.cancel()` 清除选中

## 主题链路

`default-theme.ts` → `useThemeStore` → `getElementTheme()` → `DEFAULT_ELEMENT_OPTIONS` / 元素库 v-bind
