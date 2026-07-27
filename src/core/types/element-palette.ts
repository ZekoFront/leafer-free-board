/** 左侧面板 — 单个可放置元素 */
export interface IElementPaletteItem {
    type: string;
    title: string;
    /** 预览形状：css class 后缀 */
    preview: string;
    draggable?: boolean;
}

/** 分组 */
export interface IElementPaletteGroup {
    key: string;
    title: string;
    items: IElementPaletteItem[];
}
