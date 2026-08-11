import type { AppTheme } from "./types";

const PRIMARY = "#1E1E1E";
const PRIMARY_DARK = "#1E1E1E";
const TRANSPARENT = "transparent";

/** 默认绿色主题 — 修改此处即可全局生效 */
export const defaultTheme: AppTheme = {
    id: "default",
    name: "默认",
    element: {
        fill: TRANSPARENT,
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
