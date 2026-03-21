import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
import { debounce } from "lodash-es";

export class HistoryHotKeyPlugin implements IPluginTempl {
    static pluginName = "HistoryHotKeyPlugin";
    static apis: string[] = [];
    hotkeys: string[] = ["ctrl+z", "ctrl+y"];

    constructor(public editorBoard: EditorBoard) {}

    private _undoDebounced = debounce(
        () => {
            this.editorBoard.history.undo();
        },
        200,
        { leading: true, trailing: false },
    );

    private _redoDebounced = debounce(
        () => {
            this.editorBoard.history.redo();
        },
        200,
        { leading: true, trailing: false },
    );

    hotkeyEvent(eventName: string, e: KeyboardEvent) {
        if (e.type !== "keyup") return;

        if (eventName === "ctrl+z") {
            this._undoDebounced();
        } else if (eventName === "ctrl+y") {
            this._redoDebounced();
        }
    }

    destroy() {
        this._undoDebounced.cancel();
        this._redoDebounced.cancel();
    }
}
