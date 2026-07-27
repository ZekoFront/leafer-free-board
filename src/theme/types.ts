/** 画布元素配色（Leafer 元素 + 元素库预览共用） */
export interface ElementThemeColors {
    /** 填充色 */
    fill: string;
    /** 描边色 */
    stroke: string;
    /** 深色描边 / 强调色 */
    strokeDark: string;
    /** 主色上的文字色 */
    onPrimary: string;
    /** 连线描边色 */
    lineStroke: string;
    /** 思维导图子主题 */
    mindSub: {
        fill: string;
        stroke: string;
        text: string;
    };
    /** 元素库面板交互色 */
    palette: {
        hoverBackground: string;
        hoverText: string;
    };
}

export interface AppTheme {
    id: string;
    name: string;
    element: ElementThemeColors;
}
