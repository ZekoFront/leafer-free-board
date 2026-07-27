import type { IElementPaletteGroup } from "@/core/types/element-palette";
import { toolbarMenu } from "./toolbar-menu";

/**
 * 左侧「更多元素」面板配置。
 * 均可拖到画布，且支持 line/curve 四边连线（需有 id 的图形节点）。
 */
export const elementPaletteGroups: IElementPaletteGroup[] = [
    {
        key: "mindmap",
        title: "思维导图",
        items: [
            { type: "mindTopic", title: "主题节点", preview: "mind-topic", draggable: true },
            { type: "mindSub", title: "子主题", preview: "mind-sub", draggable: true },
        ],
    },
    {
        key: "basic",
        title: "基础图形",
        items: [
            { type: "rect", title: "矩形", preview: "rect", draggable: true },
            { type: "roundedRect", title: "圆角矩形", preview: "rounded-rect", draggable: true },
            { type: "circle", title: "圆形", preview: "circle", draggable: true },
            { type: "ellipse", title: "椭圆", preview: "ellipse", draggable: true },
        ],
    },
    {
        key: "polygon",
        title: "多边形",
        items: [
            { type: "diamond", title: "菱形", preview: "diamond", draggable: true },
            { type: "triangle", title: "三角形", preview: "triangle", draggable: true },
            { type: "pentagon", title: "五边形", preview: "pentagon", draggable: true },
            { type: "hexagon", title: "六边形", preview: "hexagon", draggable: true },
        ],
    },
];

/** 所有可拖拽放置到画布的 type（工具栏 + 左侧面板） */
export function getDraggableElementTypes(): Set<string> {
    const fromToolbar = toolbarMenu
        .filter((item) => item.draggable)
        .map((item) => item.type);
    const fromPalette = elementPaletteGroups.flatMap((group) =>
        group.items.filter((item) => item.draggable !== false).map((item) => item.type),
    );
    return new Set([...fromToolbar, ...fromPalette]);
}
