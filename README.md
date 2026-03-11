# leafer-free-board

基于 **Vue 3 + TypeScript + Leafer.js** 的轻量级自由白板应用。支持拖拽创建图形、灵活布局与编辑，适用于草图绘制、原型设计等场景。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建工具 | Vite (rolldown-vite) |
| 画布引擎 | Leafer.js 2.x (`leafer-ui`, `@leafer-in/*`) |
| UI 组件库 | Naive UI |
| 状态管理 | Pinia |
| 工具库 | VueUse, lodash-es, decimal.js, hotkeys-js, lz-string |
| 代码格式化 | oxfmt |

## 核心架构

### EditorBoard — 编辑器核心

`EditorBoard` 继承自 `EventEmitter`，是整个白板的核心控制器，负责：

- **初始化** Leafer `App` 引擎
- **插件管理**：通过 `use()` 方法注册插件，自动绑定快捷键和 API 代理
- **元素操作**：添加 (`addLeaferElement`)、删除 (`removeLeaferElement`)、查询 (`getById`)
- **历史记录**：内置 `HistoryManager`，支持撤销/重做
- **生命周期**：`init()` 初始化、`destroy()` 销毁释放资源

```typescript
const editorBoard = new EditorBoard();
editorBoard.init(app);
editorBoard.use(SnapPlugin);
editorBoard.use(ShapePlugin);
```

### 插件系统

所有插件实现 `IPluginTempl` 接口，支持：

- `pluginName`：插件唯一名称
- `apis`：暴露给 EditorBoard 的 API 方法名列表
- `hotkeys`：快捷键绑定
- `events`：自定义事件
- `hotkeyEvent()`：快捷键回调
- `destroy()`：销毁清理

#### 内置插件一览

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| **HandlerPlugin** | 核心事件处理（选择、拖拽开始/移动/结束、连线更新） | — |
| **ShapePlugin** | 图形创建（拖拽创建、指针绘制箭头/直线/曲线连线） | — |
| **CopyPlugin** | 复制粘贴元素 | `Ctrl+C` / `Ctrl+V` |
| **DeleteHotKeyPlugin** | 删除选中元素 | `Backspace` / `Delete` |
| **SnapPlugin** | 元素吸附对齐 (基于 leafer-x-easy-snap) | — |
| **RulerPlugin** | X/Y 轴标尺，选中元素遮罩高亮 | — |
| **ScrollBarPlugin** | 滚动条 (基于 @leafer-in/scroll) | — |
| **DotMatrixPlugin** | 点阵网格背景 (基于 leafer-x-dot-matrix) | — |

### 历史记录系统 (撤销/重做)

基于 **命令模式 (Command Pattern)** 实现：

- `HistoryManager`：管理撤销栈和重做栈，最大记录数可配置（默认 50）
- 命令类型（`ExecuteTypeEnum`）：
  - `AddElement` — 添加元素
  - `DeleteElement` — 删除元素
  - `MoveElement` — 移动元素
  - `UpdateAttribute` — 更新属性
  - `Paste` — 粘贴元素
- 每个命令支持 `compress()` / `decompress()` 用于内存优化
- 通过 `history:change` 事件通知 UI 更新

```typescript
editorBoard.history.execute(element);  // 执行命令
editorBoard.history.undo();            // 撤销
editorBoard.history.redo();            // 重做
```

### 支持的图形类型

通过工具栏可创建以下图形（定义在 `creatElement.ts`）：

| 图形 | 类型标识 | 创建方式 | 说明 |
|------|----------|----------|------|
| 选择工具 | `select` | 点击 | 选择已有元素 |
| 矩形 | `rect` | 拖拽 | Box 容器 + 内嵌可编辑文本 |
| 圆形 | `circle` | 拖拽 | Group(Ellipse + Text) |
| 椭圆 | `ellipse` | 拖拽 | Group(Ellipse + Text) |
| 菱形 | `diamond` | 拖拽 | Group(Polygon + Text) |
| 文本 | `text` | 拖拽 | 独立可编辑文本元素 |
| 箭头 | `arrow` | 指针绘制 | 曲线箭头 |
| 直线连线 | `line` | 指针绘制 | 带箭头的元素间连线 |
| 曲线连线 | `curve` | 指针绘制 | 贝塞尔曲线元素间连线 |

## Leafer App 引擎配置

画板使用 Leafer `App` 引擎，配置了多层架构：

```typescript
const app = new App({
    view: boardRef.value,
    ground: { fill: '#91124c' },           // 底层背景
    tree: { type: 'design' },              // 设计模式：空格键拖拽画布
    editor: {                              // 编辑器配置
        point: { cornerRadius: 0 },
        middlePoint: {},
        rotatePoint: { width: 16, height: 16, cursor: 'all-scroll' },
        rect: { dashPattern: [3, 2] },
        buttonsDirection: 'top',
    },
    sky: {},                               // Sky 层（标尺等覆盖层）
    fill: '#ffffff',                       // 背景色
    touch: { preventDefault: false },
    pointer: { preventDefaultMenu: true }, // 阻止浏览器右键菜单
});
```

## 选择事件系统

通过 `SelectMode` 和 `SelectEvent` 枚举管理元素选择状态：

- `SelectMode.EMPTY` — 未选中
- `SelectMode.SINGLE` — 单选
- `SelectMode.MULTIPLE` — 多选

`HandlerPlugin` 监听编辑器的 `EditorEvent.SELECT` 事件并分发到 EditorBoard 的事件总线上，各插件（如 `CopyPlugin`、`DeleteHotKeyPlugin`）通过监听这些事件获取当前选中元素。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 格式化代码
npm run fmt
```

## 连线功能

支持元素之间的连接线绘制：

1. **直线连线**：选择"直线连线"工具，从一个元素拖拽到另一个元素，自动计算最佳连接点并生成带箭头的直线
2. **曲线连线**：选择"曲线连接"工具，同样拖拽操作，生成贝塞尔曲线连接
3. **动态更新**：当连接的元素被拖拽移动、缩放或旋转时，连线自动跟随更新位置

连接点计算基于元素的世界坐标包围盒 (`worldBoxBounds`)，通过 `getBestConnectionByWorldBoxBounds()` 函数自动选择最优的连接方向。

## 碰撞检测

支持元素之间的碰撞检测，通过 Leafer 提供的 `Bounds` API 在世界坐标中进行跨层级检测：

```typescript
text.on(DragEvent.DRAG, () => {
    const rect2Bounds = new Bounds(rect.worldBoxBounds);
    text.fill = rect2Bounds.hit(text.worldBoxBounds) ? 'blue' : '#FFE04B';
});
```

## 关键依赖说明

| 依赖 | 用途 |
|------|------|
| `leafer-ui` | Leafer 画布引擎核心 |
| `@leafer-in/editor` | 图形编辑器（选择、缩放、旋转） |
| `@leafer-in/viewport` | 视口控制 |
| `@leafer-in/text-editor` | 文本编辑 |
| `@leafer-in/arrow` | 箭头图形 |
| `@leafer-in/find` | 元素查找 |
| `@leafer-in/export` | 导出功能 |
| `@leafer-in/scroll` | 滚动条 |
| `@leafer-in/view` | 视图控制（平移、缩放） |
| `leafer-x-easy-snap` | 智能吸附对齐 |
| `leafer-x-dot-matrix` | 点阵网格背景 |
| `hotkeys-js` | 快捷键绑定 |
| `lz-string` | 数据压缩（历史记录优化） |
| `naive-ui` | UI 组件库 |
| `pinia` | 状态管理 |
| `uuid` | 元素唯一 ID 生成 |
