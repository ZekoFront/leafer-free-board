import type { HistoryStateSnapshot } from "@/plugins/history/HistoryPlugin";

export interface ICanvasSnapshot {
    canvas: unknown[];
    connections?: unknown[];
    history?: HistoryStateSnapshot;
    version: number;
    timestamp: number;
}
