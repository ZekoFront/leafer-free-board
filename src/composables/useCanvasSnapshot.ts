import LZString from "lz-string";
import type { ICanvasSnapshot } from "@/core/types";

const DEFAULT_STORAGE_KEY = "leafer-editor-canvas-state";

export function useCanvasSnapshot(storageKey = DEFAULT_STORAGE_KEY) {
    function save(snapshot: ICanvasSnapshot) {
        try {
            const json = JSON.stringify(snapshot);
            const compressed = LZString.compressToUTF16(json);
            localStorage.setItem(storageKey, compressed);
        } catch (err) {
            console.error("[CanvasSnapshot] 保存失败:", err);
        }
    }

    function load(): ICanvasSnapshot | null {
        try {
            const compressed = localStorage.getItem(storageKey);
            if (!compressed) return null;
            const json = LZString.decompressFromUTF16(compressed);
            if (!json) return null;
            return JSON.parse(json) as ICanvasSnapshot;
        } catch (err) {
            console.error("[CanvasSnapshot] 加载失败:", err);
            return null;
        }
    }

    function clear() {
        localStorage.removeItem(storageKey);
    }

    return { save, load, clear, storageKey };
}
