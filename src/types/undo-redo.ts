export interface ICommand {
    id: string;
    name: string;
    timestamp: number;
    execute(): void;
    undo(): void;
    redo(): void;
    dispose(): void;
    canMerge?(command: ICommand): boolean;
    merge?(command: ICommand): void;
}

export interface UndoRedoState {
    canUndo: boolean;
    canRedo: boolean;
    undoCount: number;
    redoCount: number;
    currentBatch: boolean;
    historySize: number;
}

export interface UndoRedoConfig {
    maxHistorySize: number;
    enableCompression: boolean;
    enableBatch: boolean;
}