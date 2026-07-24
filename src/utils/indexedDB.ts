/**
 * IndexedDB 画布快照持久化
 *
 * 存储 EditorCore.saveSnapshot() 产出的 ICanvasSnapshot，
 * 供 useCanvasSnapshot / useCanvasLifecycle 自动保存使用。
 */

import type { ICanvasSnapshot } from "@/core/types";

/** 与 useCanvasSnapshot 默认 key 保持一致 */
export const DEFAULT_CANVAS_STORAGE_KEY = "leafer-editor-canvas-state";

const DB_NAME = "leafer-free-board";
const DB_VERSION = 1;
const STORE_NAME = "canvas-snapshots";

interface CanvasSnapshotRecord {
    key: string;
    snapshot: ICanvasSnapshot;
    timestamp: number;
}

export function checkIndexedDBSupport(): boolean {
    return typeof indexedDB !== "undefined";
}

function cloneSnapshot(snapshot: ICanvasSnapshot): ICanvasSnapshot {
    return JSON.parse(JSON.stringify(snapshot)) as ICanvasSnapshot;
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!checkIndexedDBSupport()) {
            reject(new Error("[IndexedDB] 当前环境不支持 IndexedDB"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(
                new Error(
                    `[IndexedDB] 打开数据库失败: ${request.error?.message ?? "unknown"}`,
                ),
            );
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "key",
                });
                store.createIndex("timestamp", "timestamp", { unique: false });
            }
        };
    });
}

function runTransaction<T>(
    mode: IDBTransactionMode,
    runner: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
    return openDatabase().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], mode);
                const store = transaction.objectStore(STORE_NAME);

                Promise.resolve(runner(store))
                    .then(resolve)
                    .catch(reject);

                transaction.oncomplete = () => {
                    db.close();
                };

                transaction.onerror = () => {
                    reject(
                        new Error(
                            `[IndexedDB] 事务失败: ${transaction.error?.message ?? "unknown"}`,
                        ),
                    );
                };
            }),
    );
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            reject(
                new Error(
                    `[IndexedDB] 请求失败: ${request.error?.message ?? "unknown"}`,
                ),
            );
        };
    });
}

/** 保存画布快照 */
export async function saveCanvasSnapshot(
    key: string,
    snapshot: ICanvasSnapshot,
): Promise<void> {
    const record: CanvasSnapshotRecord = {
        key,
        snapshot: cloneSnapshot(snapshot),
        timestamp: Date.now(),
    };

    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.put(record));
    });
}

/** 读取画布快照 */
export async function loadCanvasSnapshot(
    key: string,
): Promise<ICanvasSnapshot | null> {
    const record = await runTransaction<CanvasSnapshotRecord | undefined>(
        "readonly",
        (store) => requestToPromise(store.get(key)),
    );

    return record?.snapshot ?? null;
}

/** 删除指定 key 的画布快照 */
export async function clearCanvasSnapshot(key: string): Promise<void> {
    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.delete(key));
    });
}

/** 清空所有画布快照 */
export async function clearAllCanvasSnapshots(): Promise<void> {
    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.clear());
    });
}
