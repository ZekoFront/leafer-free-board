# leafer-free-board

基于 **Vue 3 + TypeScript + Leafer.js 2.x** 的自由画板项目，同时作为 npm 包 **`@leafer-free/board`** 发布。

提供**可编辑画板**（`EditorCanvas`）与**渲染预览**（`RenderCanvas`）两种模式：插件化扩展工具能力，以**快照**（`ICanvasSnapshot`）驱动数据流转与预览。

> 详细架构说明见 [新架构文档.md](./新架构文档.md)

## 特性

- **双引擎容器**：编辑模式 + 渲染模式，共享 `CanvasContext` / `EditorCore`
- **插件注入**：吸附、标尺、连线、复制粘贴、历史记录等按需 `use()` 注册
- **元素库**：工具栏 + 左侧面板，支持基础图形、多边形、星形、思维导图节点等
- **元素连线**：直线 / 曲线连线，多边形与星形贴边连接，拖拽时自动更新
- **撤销 / 重做**：`HistoryPlugin` 命令栈，支持快照导入导出
- **主题系统**：Pinia 管理元素配色，供 UI 与 Leafer 工厂共享
- **Vue 插件**：`app.use(LeaferBoard)` 全局注册，或按需引入组件

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 8（Rolldown）+ vue-tsc + vite-plugin-dts |
| 画布引擎 | Leafer.js 2.x（`leafer-ui`、`@leafer-in/*`） |
| UI | Naive UI |
| 状态 | Pinia |
| 工具 | VueUse、lodash-es、decimal.js、hotkeys-js、lz-string |
| 格式化 | oxfmt |

## 快速开始（本地 Playground）

```bash
# 安装依赖（推荐 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 构建 Playground（GitHub Pages）
pnpm build

# 预览构建结果
pnpm preview

# 构建 npm 库（dist/index.js + dist/index.d.ts）
pnpm run build:lib

# 格式化代码
pnpm fmt
```

Playground 入口：`src/playground/App.vue`，默认挂载 `<EditorCanvas />`。

## 作为 npm 包使用

### 安装

```bash
pnpm add @leafer-free/board
# peer: vue ^3.5、leafer-ui ^2.0、pinia ^3.0
```

### 全局注册

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import LeaferBoard from "@leafer-free/board";
// import "@leafer-free/board/styles";

const app = createApp(App);
app.use(createPinia()); // 主题 store 需要 Pinia
app.use(LeaferBoard);   // 注册 EditorCanvas / RenderCanvas / CanvasProvider
app.mount("#app");
```

```vue
<template>
  <EditorCanvas @ready="onReady" />
</template>
```

### 按需引入

```typescript
import {
  EditorCanvas,
  RenderCanvas,
  SnapPlugin,
  useEditorCore,
  useHistory,
} from "@leafer-free/board";

// 仅编辑组件
import { EditorCanvas } from "@leafer-free/board/editor";

// 仅插件
import { ShapePlugin, ConnectionPlugin } from "@leafer-free/board/plugins";
```

### 部分全局注册

```typescript
import { install } from "@leafer-free/board";

app.use({
  install: (app) => install(app, { components: ["EditorCanvas"] }),
});
```

### 包导出路径

| 路径 | 说明 |
|------|------|
| `@leafer-free/board` | 主入口：组件、Core、插件、Composables、类型 |
| `@leafer-free/board/editor` | `EditorCanvas` |
| `@leafer-free/board/render` | `RenderCanvas` |
| `@leafer-free/board/plugins` | 全部插件类 |
| `@leafer-free/board/styles` | 组件样式（构建产物） |

## 架构概览

```
消费方 App
    │
    ├── EditorCanvas（编辑）    RenderCanvas（预览）
    │         └────── CanvasProvider ──────┘
    │                      │
    │               CanvasContext（单 App + EditorCore）
    │                      │
    │          EditorCore · History · Snapshot
    │                      │
    └────────────── Plugins（Handler / Shape / Connection …）
                           │
                    Leafer.js App
```

### 命名对照（旧 → 新）

| 旧名 | 新名 |
|------|------|
| `EditorBoard` | `EditorCore` |
| `BoardContext` | `CanvasContext` |
| `EditorBoard.vue` | `EditorCanvas.vue` |
| `IBoardSnapshot` | `ICanvasSnapshot` |
| `useEditorBoard` | `useEditorCore` |

### EditorCore

`EditorCore` 继承 `EventEmitter`，是每个画板实例的控制器：

- 绑定 Leafer `App`（`bindApp` / `releaseApp`）
- 插件注册：`use(PluginClass, options?)`，自动绑定快捷键与 API
- 快照：`saveSnapshot()` / `loadSnapshot()` / `clearCanvas()`
- 元素查询：`getById(id)`
- 生命周期：`destroy()`

```typescript
const editor = useEditorCore();
editor.use(SnapPlugin);
const snapshot = editor.saveSnapshot();
```

### CanvasContext

由 `CanvasProvider` 创建，持有唯一的 `app` 与 `editor`，负责插件装配与销毁，禁止在组件 / 插件内直接 `new App()`。

## 插件系统

插件实现 `IPluginTempl` 接口，通过 `EditorCore.use()` 注册。编辑模式默认插件见 `DEFAULT_EDIT_PLUGINS`（`ConnectionPlugin` 须在 `ShapePlugin`、`HistoryPlugin` 之前）。

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| **HandlerPlugin** | 选择、拖拽、属性变更、连线同步 | — |
| **ConnectionPlugin** | 连线拓扑管理、导入导出 | — |
| **ShapePlugin** | 拖拽创建图形、指针绘制连线 / 箭头 / 画笔 | — |
| **HistoryPlugin** | 撤销 / 重做命令栈 | — |
| **CopyPlugin** | 复制粘贴（含内部连线重建） | `Ctrl+C` / `Ctrl+V` |
| **DeleteHotKeyPlugin** | 删除选中元素 | `Backspace` / `Delete` |
| **SnapPlugin** | 智能吸附（leafer-x-easy-snap） | — |
| **RulerPlugin** | X/Y 标尺 | — |
| **ScrollBarPlugin** | 滚动条 | — |
| **DotMatrixPlugin** | 点阵网格 | — |
| **ViewportPlugin** | 渲染模式视口（可选） | — |

自定义插件：

```typescript
import type { IPluginTempl } from "@leafer-free/board";

class MyPlugin implements IPluginTempl {
  static pluginName = "MyPlugin";
  constructor(public editor: EditorCore, public options = {}) {}
  destroy() {}
}

editor.use(MyPlugin);
```

## 历史记录

由 `HistoryPlugin` 实现命令模式，通过 `useHistory()` 或 `CustomEvent.CHANGE`（`history:change`）驱动 UI：

```typescript
const { canUndo, canRedo, undo, redo } = useHistory();
```

命令类型包括：`AddElement`、`DeleteElement`、`MoveElement`、`UpdateAttribute`、`Paste` 等。

## 快照与连线

**快照** `ICanvasSnapshot` 包含：

- `canvas`：Leafer 元素 JSON 数组
- `connections`：连线关系序列化
- `history`（可选）：历史栈
- `version` / `timestamp`

**连线**：

1. 选择「直线连线」或「曲线连接」，从元素 A 拖到元素 B
2. 基于世界坐标包围盒计算最佳连接点（`getBestConnectionByWorldBoxBounds`）
3. 多边形 / 星形使用轮廓射线求交，连线贴边无空白
4. 元素移动、缩放、旋转时连线自动更新

## 支持的图形

**工具栏**：选择、矩形、圆形、椭圆、菱形、文本、箭头、直线连线、曲线连线、画笔

**元素库（左侧面板）**：

| 分组 | 类型 |
|------|------|
| 思维导图 | 主题节点、子主题 |
| 基础图形 | 矩形、圆角矩形、圆形、椭圆 |
| 多边形 | 菱形、三角形、五 / 六边形 |
| 星形 | 四 / 五 / 六 / 七 / 八角星 |

通过 `createElement(type, point)` 工厂统一创建。

## 目录结构

```
src/
├── index.ts              # npm 主入口
├── install.ts            # Vue 插件 install
├── playground/           # 本地 Demo
├── engine/
│   ├── edit/             # EditorCanvas、CanvasProvider
│   └── render/           # RenderCanvas
├── core/                 # EditorCore、CanvasContext、元素工厂、几何
├── plugins/              # 可注入插件
├── composables/          # useEditorCore、useHistory 等
├── components/           # 工具栏、属性面板、元素库
├── theme/                # 主题与 Pinia store
├── config/               # 工具栏、元素库配置
└── styles/               # 对外样式入口
```

## 构建说明

| 命令 | 用途 | 产物 |
|------|------|------|
| `pnpm build` | Playground 站点 | `dist/`（带 hash 的静态资源） |
| `pnpm run build:lib` | npm 库发布 | `dist/index.js`、`dist/index.d.ts`、`dist/plugins/` |

CI（`.github/workflows/deploy.yml`）在 `main` 分支 push 后执行 `pnpm install --frozen-lockfile` + `pnpm build`，部署至 GitHub Pages。

> 修改 `package.json` 依赖后请运行 `pnpm install` 并提交 `pnpm-lock.yaml`，否则 CI 会因 lockfile 不一致失败。

## 关键依赖

| 依赖 | 用途 |
|------|------|
| `leafer-ui` | Leafer 画布引擎 |
| `@leafer-in/editor` | 图形编辑器 |
| `@leafer-in/viewport` | 视口 |
| `@leafer-in/text-editor` | 文本编辑 |
| `@leafer-in/arrow` | 箭头 |
| `@leafer-in/resize` | 缩放控制 |
| `leafer-x-easy-snap` | 智能吸附 |
| `leafer-x-dot-matrix` | 点阵背景 |
| `hotkeys-js` | 快捷键 |
| `lz-string` | 快照 / 历史压缩 |
| `naive-ui` | UI 组件 |
| `pinia` | 主题与状态 |

## License

MIT
