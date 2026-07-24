import LZString from "lz-string";
import type { ICanvasSnapshot } from "@/core/types";
import {
    checkIndexedDBSupport,
    clearCanvasSnapshot,
    DEFAULT_CANVAS_STORAGE_KEY,
    loadCanvasSnapshot,
    saveCanvasSnapshot,
} from "@/utils/indexedDB";

export function useCanvasSnapshot(
    storageKey = DEFAULT_CANVAS_STORAGE_KEY,
) {
    function saveToLocalStorage(snapshot: ICanvasSnapshot) {
        const json = JSON.stringify(snapshot);
        const compressed = LZString.compressToUTF16(json);
        localStorage.setItem(storageKey, compressed);
    }

    function loadFromLocalStorage(): ICanvasSnapshot | null {
        const compressed = localStorage.getItem(storageKey);
        if (!compressed) return null;

        const json = LZString.decompressFromUTF16(compressed);
        if (!json) return null;

        return JSON.parse(json) as ICanvasSnapshot;
    }

    function clearLocalStorage() {
        localStorage.removeItem(storageKey);
    }

    /** 优先写入 IndexedDB，不支持时回退 localStorage */
    function save(snapshot: ICanvasSnapshot) {
        if (checkIndexedDBSupport()) {
            saveCanvasSnapshot(storageKey, snapshot).catch((err) => {
                console.error("[CanvasSnapshot] IndexedDB 保存失败，回退 localStorage:", err);
                try {
                    saveToLocalStorage(snapshot);
                } catch (localErr) {
                    console.error("[CanvasSnapshot] localStorage 保存失败:", localErr);
                }
            });
            return;
        }

        try {
            saveToLocalStorage(snapshot);
        } catch (err) {
            console.error("[CanvasSnapshot] 保存失败:", err);
        }
    }

    /** 优先从 IndexedDB 读取，再尝试 localStorage */
    async function load(): Promise<ICanvasSnapshot | null> {
        if (checkIndexedDBSupport()) {
            try {
                const snapshot = await loadCanvasSnapshot(storageKey);
                if (snapshot) return snapshot;
            } catch (err) {
                console.error("[CanvasSnapshot] IndexedDB 读取失败，回退 localStorage:", err);
            }
        }

        try {
            return loadFromLocalStorage();
        } catch (err) {
            console.error("[CanvasSnapshot] 加载失败:", err);
            return null;
        }
    }

    /** 同时清理 IndexedDB 与 localStorage */
    function clear() {
        clearLocalStorage();

        if (checkIndexedDBSupport()) {
            clearCanvasSnapshot(storageKey).catch((err) => {
                console.error("[CanvasSnapshot] IndexedDB 清理失败:", err);
            });
        }
    }

    /** 有内容则保存，空画布则清除存储 */
    function persist(snapshot: ICanvasSnapshot) {
        const hasCanvas = (snapshot.canvas?.length ?? 0) > 0;
        const hasHistory =
            (snapshot.history?.undoStack?.length ?? 0) > 0 ||
            (snapshot.history?.redoStack?.length ?? 0) > 0;

        if (!hasCanvas && !hasHistory) {
            clear();
            return;
        }

        save(snapshot);
    }

    return { save, load, clear, persist, storageKey };
}
