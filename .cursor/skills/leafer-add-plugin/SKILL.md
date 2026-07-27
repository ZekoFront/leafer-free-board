---
name: leafer-add-plugin
description: >-
  Add a new EditorCore plugin to leafer-free-board. Use when creating plugins,
  hotkeys, editor.use registration, ConnectionPlugin/HistoryPlugin integration,
  or extending ShapePlugin-like interactions.
---

# 新增插件

## 步骤

1. 创建 `src/plugins/{core|edit|history}/XxxPlugin.ts`
2. 实现 `IPluginTempl`，`constructor(public editor: EditorCore)`
3. `static pluginName` + 可选 `static apis`、`hotkeys`
4. `src/plugins/index.ts` export
5. 加入 `src/engine/edit/default-plugins.ts`（注意顺序）

## 注册顺序约束

```
HandlerPlugin → ConnectionPlugin → … → ShapePlugin → HistoryPlugin → …
```

ConnectionPlugin 必须先于 ShapePlugin / HistoryPlugin。

## 与其他插件协作

| 场景 | 做法 |
|------|------|
| 删除节点 | 先 `removeConnectionsForNode`，再 `node.remove()` |
| 粘贴/导入 | `tree.add` 后 ConnectionPlugin import/rebuild |
| 临时预览 | `runWithoutRecording(() => tree.add(preview))` |
| 读取选中 | `editor.app.editor.list` |
| 快捷键 | 检测 `document.activeElement` 是否为输入框 |

## destroy 必须

- `off` 所有 `editor.on` / `app.on` 监听
- `debounce.cancel()`
- 清空内部引用

## 示例位置

参考：`DeleteHotKeyPlugin.ts`、`CopyPlugin.ts`、`ConnectionPlugin.ts`
