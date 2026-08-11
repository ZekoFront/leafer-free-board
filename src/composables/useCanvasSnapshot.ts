import LZString from "lz-string";
import type { CanvasStateSnapshot, ICanvasSnapshot } from "@/core/types";
import type { HistoryStateSnapshot } from "@/plugins/history/HistoryPlugin";
import {
    checkIndexedDBSupport,
    clearStoredValue,
    DEFAULT_CANVAS_STORAGE_KEY,
    loadStoredValue,
    saveStoredValue,
} from "@/utils/indexedDB";
import { MAX_CACHED_CANVAS_ELEMENTS } from "@/core/constants";

export function useCanvasSnapshot(storageKey = DEFAULT_CANVAS_STORAGE_KEY) {
    /** 画布元素缓存 key（不含历史记录） */
    const canvasKey = storageKey;
    /** 历史记录使用独立 key，与画布元素缓存分离 */
    const historyKey = `${storageKey}:history`;

    function saveToLocalStorage<T>(key: string, value: T) {
        const json = JSON.stringify(value);
        const compressed = LZString.compressToUTF16(json);
        localStorage.setItem(key, compressed);
    }

    function loadFromLocalStorage<T>(key: string): T | null {
        const compressed = localStorage.getItem(key);
        if (!compressed) return null;

        const json = LZString.decompressFromUTF16(compressed);
        if (!json) return null;

        return JSON.parse(json) as T;
    }

    function clearLocalStorage(key: string) {
        localStorage.removeItem(key);
    }

    /** 优先写入 IndexedDB，不支持时回退 localStorage */
    function saveValue<T>(key: string, value: T) {
        if (checkIndexedDBSupport()) {
            saveStoredValue(key, value).catch((err) => {
                console.error(
                    `[CanvasSnapshot] IndexedDB 保存失败(${key})，回退 localStorage:`,
                    err,
                );
                try {
                    saveToLocalStorage(key, value);
                } catch (localErr) {
                    console.error(
                        "[CanvasSnapshot] localStorage 保存失败:",
                        localErr,
                    );
                }
            });
            return;
        }

        try {
            saveToLocalStorage(key, value);
        } catch (err) {
            console.error(`[CanvasSnapshot] 保存失败(${key}):`, err);
        }
    }

    /** 优先从 IndexedDB 读取，再尝试 localStorage */
    async function loadValue<T>(key: string): Promise<T | null> {
        if (checkIndexedDBSupport()) {
            try {
                const value = await loadStoredValue<T>(key);
                if (value) return value;
            } catch (err) {
                console.error(
                    `[CanvasSnapshot] IndexedDB 读取失败(${key})，回退 localStorage:`,
                    err,
                );
            }
        }

        try {
            return loadFromLocalStorage<T>(key);
        } catch (err) {
            console.error(`[CanvasSnapshot] 加载失败(${key}):`, err);
            return null;
        }
    }

    function clearValue(key: string) {
        clearLocalStorage(key);
        if (checkIndexedDBSupport()) {
            clearStoredValue(key).catch((err) => {
                console.error("[CanvasSnapshot] IndexedDB 清理失败:", err);
            });
        }
    }

    /** 从完整快照中剥离历史记录，只保留画布元素与连接拓扑 */
    function toCanvasState(snapshot: ICanvasSnapshot): CanvasStateSnapshot {
        return {
            canvas: snapshot.canvas,
            connections: snapshot.connections,
            version: snapshot.version,
            timestamp: snapshot.timestamp,
        };
    }

    /** 旧版本快照：canvas + history 存在同一份数据里 */
    function isCombinedSnapshot(value: unknown): value is ICanvasSnapshot {
        return (
            !!value &&
            Array.isArray((value as ICanvasSnapshot).canvas) &&
            !!(value as ICanvasSnapshot).history
        );
    }

    /** 保存画布元素缓存（不含历史记录） */
    function saveCanvasState(snapshot: ICanvasSnapshot | CanvasStateSnapshot) {
        saveValue(
            canvasKey,
            isCombinedSnapshot(snapshot) ? toCanvasState(snapshot) : snapshot,
        );
    }

    /** 保存历史记录缓存（仅 undo/redo 栈） */
    function saveHistoryState(history: HistoryStateSnapshot) {
        saveValue(historyKey, history);
    }

    function clearHistoryState() {
        clearValue(historyKey);
    }

    /**
     * 读取画布元素缓存。
     * 旧版本单 key 快照会自动拆分迁移为「画布 + 历史」两份缓存。
     */
    async function loadCanvasState(): Promise<CanvasStateSnapshot | null> {
        const loaded = await loadValue<CanvasStateSnapshot | ICanvasSnapshot>(
            canvasKey,
        );
        if (!loaded) return null;

        // 兼容旧版本：canvas + history 同 key 存储，读取时自动拆分
        if (isCombinedSnapshot(loaded)) {
            const canvasState = toCanvasState(loaded);
            saveCanvasState(canvasState);
            const history = loaded.history;
            if (
                (history?.undoStack?.length ?? 0) > 0 ||
                (history?.redoStack?.length ?? 0) > 0
            ) {
                saveHistoryState(history!);
            } else {
                clearHistoryState();
            }
            return canvasState;
        }

        const canvasState = loaded as CanvasStateSnapshot;
        const elementCount = canvasState.canvas?.length ?? 0;
        if (elementCount > MAX_CACHED_CANVAS_ELEMENTS) {
            console.warn(
                `[CanvasSnapshot] 画布元素数 ${elementCount} 超过缓存上限 ${MAX_CACHED_CANVAS_ELEMENTS}，跳过恢复以避免卡顿`,
            );
            return null;
        }
        return canvasState;
    }

    /** 读取历史记录缓存 */
    async function loadHistoryState(): Promise<HistoryStateSnapshot | null> {
        return loadValue<HistoryStateSnapshot>(historyKey);
    }

    /**
     * 有内容则保存：画布元素与历史记录分别落各自 key。
     * 画布元素数超过上限时跳过持久化，避免浏览器卡死。
     */
    function persist(snapshot: ICanvasSnapshot) {
        const hasCanvas = (snapshot.canvas?.length ?? 0) > 0;
        const hasHistory =
            (snapshot.history?.undoStack?.length ?? 0) > 0 ||
            (snapshot.history?.redoStack?.length ?? 0) > 0;

        if (!hasCanvas && !hasHistory) {
            clear();
            return;
        }

        const elementCount = snapshot.canvas?.length ?? 0;
        if (elementCount > MAX_CACHED_CANVAS_ELEMENTS) {
            console.warn(
                `[CanvasSnapshot] 画布元素数 ${elementCount} 超过缓存上限 ${MAX_CACHED_CANVAS_ELEMENTS}，跳过持久化以避免卡顿`,
            );
            return;
        }

        saveCanvasState(snapshot);
        if (hasHistory) {
            saveHistoryState(snapshot.history!);
        } else {
            clearHistoryState();
        }
    }

    /** 同时清理画布与历史缓存 */
    function clear() {
        clearValue(canvasKey);
        clearValue(historyKey);
    }

    return {
        saveCanvasState,
        loadCanvasState,
        saveHistoryState,
        loadHistoryState,
        clear,
        persist,
        canvasKey,
        historyKey,
    };
}
