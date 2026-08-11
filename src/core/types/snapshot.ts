import type { HistoryStateSnapshot } from "@/plugins/history/HistoryPlugin";

export interface ICanvasSnapshot {
    canvas: unknown[];
    connections?: unknown[];
    history?: HistoryStateSnapshot;
    version: number;
    timestamp: number;
}

/**
 * 画布状态缓存（不含历史记录）。
 * 单独缓存用于刷新后恢复，避免与撤销/重做栈耦合在同一份数据中。
 */
export type CanvasStateSnapshot = Omit<ICanvasSnapshot, "history">;
