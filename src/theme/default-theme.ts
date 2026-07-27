import type { AppTheme } from "./types";

const PRIMARY = "#32cd79";
const PRIMARY_DARK = "#2ab86a";

/** 默认绿色主题 — 修改此处即可全局生效 */
export const defaultTheme: AppTheme = {
    id: "default",
    name: "默认",
    element: {
        fill: PRIMARY,
        stroke: PRIMARY,
        strokeDark: PRIMARY_DARK,
        onPrimary: "#ffffff",
        lineStroke: "#000000",
        mindSub: {
            fill: "#ffffff",
            stroke: PRIMARY,
            text: "#333333",
        },
        palette: {
            hoverBackground: "rgba(50, 205, 121, 0.08)",
            hoverText: PRIMARY_DARK,
        },
    },
};
