import { getElementTheme } from "@/theme/getElementTheme";

/** 与主题无关的默认元素行为 / 尺寸 */
const STATIC_ELEMENT_OPTIONS = {
    cornerRadius: 10,
    strokeWidth: 1,
    opacity: 1,
    text: "双击编辑",
    width: 100,
    height: 100,
    editable: true,
    draggable: true,
} as const;

function syncThemeColors() {
    const theme = getElementTheme();
    return {
        fill: theme.fill,
        stroke: theme.stroke,
        fontColor: theme.onPrimary,
        lineStroke: theme.lineStroke,
    };
}

/** 绘制元素的公共选项（颜色来自 theme store，切换主题后新建元素自动生效） */
export const DEFAULT_ELEMENT_OPTIONS = {
    ...STATIC_ELEMENT_OPTIONS,
    ...syncThemeColors(),
};

export function refreshDefaultElementOptions() {
    Object.assign(DEFAULT_ELEMENT_OPTIONS, syncThemeColors());
}

/**
 * 画布元素缓存上限：
 * 超过该数量时跳过持久化，避免大画布序列化导致浏览器卡顿/崩溃。
 */
export const MAX_CACHED_CANVAS_ELEMENTS = 500;

/** 粘贴元素时 x/y 共用累加偏移（相对剪贴板原始坐标） */
export const PASTE_OFFSET = 15;
