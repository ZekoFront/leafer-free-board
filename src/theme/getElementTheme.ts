import { getActivePinia } from "pinia";
import { defaultTheme } from "./default-theme";
import { useThemeStore } from "@/store/useThemeStore";
import type { ElementThemeColors } from "./types";

/** 供 Leafer 元素工厂等非 Vue 上下文读取当前元素主题 */
export function getElementTheme(): ElementThemeColors {
    const pinia = getActivePinia();
    if (pinia) {
        return useThemeStore(pinia).elementTheme;
    }
    return defaultTheme.element;
}
