/**
 * IndexedDB 画布状态与历史记录持久化
 *
 * 画布元素与历史记录分开缓存，互不耦合：
 * - DEFAULT_CANVAS_STORAGE_KEY   画布元素 + 连接拓扑（防止刷新后丢失）
 * - DEFAULT_HISTORY_STORAGE_KEY  撤销/重做栈（刷新后可继续撤销/重做）
 */

/** 画布元素缓存 key（不含历史记录） */
export const DEFAULT_CANVAS_STORAGE_KEY = "leafer-editor-canvas-state";

/** 历史记录缓存 key（仅 undo/redo 栈） */
export const DEFAULT_HISTORY_STORAGE_KEY = "leafer-editor-history-state";

const DB_NAME = "leafer-free-board";
const DB_VERSION = 1;
const STORE_NAME = "canvas-snapshots";

interface StoredRecord<T> {
    key: string;
    snapshot: T;
    timestamp: number;
}

export function checkIndexedDBSupport(): boolean {
    return typeof indexedDB !== "undefined";
}

function cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
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

                Promise.resolve(runner(store)).then(resolve).catch(reject);

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

/** 保存任意类型的缓存值（画布状态 / 历史记录按 key 区分） */
export async function saveStoredValue<T>(key: string, value: T): Promise<void> {
    const record: StoredRecord<T> = {
        key,
        snapshot: cloneValue(value),
        timestamp: Date.now(),
    };

    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.put(record));
    });
}

/** 读取指定 key 的缓存值 */
export async function loadStoredValue<T>(key: string): Promise<T | null> {
    const record = await runTransaction<StoredRecord<T> | undefined>(
        "readonly",
        (store) => requestToPromise(store.get(key)),
    );

    return record?.snapshot ?? null;
}

/** 删除指定 key 的缓存 */
export async function clearStoredValue(key: string): Promise<void> {
    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.delete(key));
    });
}

/** 清空全部缓存 */
export async function clearAllStoredValues(): Promise<void> {
    await runTransaction("readwrite", (store) => {
        return requestToPromise(store.clear());
    });
}
