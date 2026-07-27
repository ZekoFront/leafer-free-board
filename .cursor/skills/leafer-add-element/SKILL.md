---
name: leafer-add-element
description: >-
  Add new draggable canvas elements to leafer-free-board element palette and
  factories. Use when adding shapes, stars, polygons, mind map nodes, palette
  previews, createElement types, or Leafer Star/Polygon/Rect elements.
---

# 新增元素库项

## 步骤

### 1. 元素工厂

`src/core/elements/xxx.ts`：

```typescript
import { Rect, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";
// 或 getElementTheme() 读主题色

export function createXxx(point: IPointData): IUI {
  return new Rect({
    id: uuidv4(),
    name: "显示名",
    x: point.x,
    y: point.y,
    draggable: true,
    editable: true,
    fill: DEFAULT_ELEMENT_OPTIONS.fill,
    // ...
  });
}
```

### 2. 注册 createElement

`src/core/elements/createElement.ts` + `index.ts`

### 3. 左侧面板

`src/config/element-palette.ts`：

```typescript
{ type: "xxx", title: "标题", preview: "xxx", draggable: true }
```

`getDraggableElementTypes()` 会自动收录。

### 4. 预览样式

`src/components/ElementPalette.vue` → `&__preview--xxx`

- 颜色：`v-bind("elementTheme.fill")`
- 星形/多边形：`clip-path: polygon(...)`（顶点算法与 Leafer 一致）

### 5. 属性面板

`ElementAttributes.vue` 中 `supportsFill` 等判断需包含新 `tag`（如 `Star`）。

## Star 预设

在 `star.ts` 扩展 `STAR_PRESETS` + `StarPresetKey`，官方参数见：
https://www.leaferjs.com/ui/reference/display/Star.html

## 连线注意

- Polygon/Star 必须可被 `isOutlineShape` 识别
- 新建后应用 line/curve 从元素 A 拖到 B 验证锚点无空白
