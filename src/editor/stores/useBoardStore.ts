import { defineStore } from "pinia";
// import LZString from "lz-string";
import type { IBoardSnapshot } from "@/editor/types";

const STORAGE_KEY = "leafer-free-board-state";

export const useBoardStore = defineStore("board", () => {
    const lastSavedAt = ref(0);

    function save(snapshot: IBoardSnapshot) {
        try {
            const json = JSON.stringify(snapshot);
            // const compressed = LZString.compressToUTF16(json);
            localStorage.setItem(STORAGE_KEY, json);
            lastSavedAt.value = Date.now();
        } catch (err) {
            console.error("[BoardStore] 保存失败:", err);
        }
    }

    function load(): IBoardSnapshot | null {
        try {
            const compressed = localStorage.getItem(STORAGE_KEY);
            if (!compressed) return null;
            // const json = LZString.decompressFromUTF16(compressed);
            // if (!json) return null;
            return JSON.parse(compressed) as IBoardSnapshot;
        } catch (err) {
            console.error("[BoardStore] 加载失败:", err);
            return null;
        }
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        lastSavedAt.value = 0;
    }

    return { lastSavedAt, save, load, clear };
});
