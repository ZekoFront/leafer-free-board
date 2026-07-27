import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { defaultTheme } from "@/theme/default-theme";
import type { AppTheme, ElementThemeColors } from "@/theme/types";
import { refreshDefaultElementOptions } from "@/core/constants/element";

export const useThemeStore = defineStore("theme", () => {
    const theme = ref<AppTheme>(structuredClone(defaultTheme));

    const elementTheme = computed(() => theme.value.element);

    async function syncDefaultElementOptions() {
        refreshDefaultElementOptions();
    }

    function setTheme(next: AppTheme) {
        theme.value = structuredClone(next);
        void syncDefaultElementOptions();
    }

    function setElementTheme(next: ElementThemeColors) {
        theme.value = {
            ...theme.value,
            element: structuredClone(next),
        };
        void syncDefaultElementOptions();
    }

    function resetTheme() {
        setTheme(defaultTheme);
    }

    return {
        theme,
        elementTheme,
        setTheme,
        setElementTheme,
        resetTheme,
    };
});
