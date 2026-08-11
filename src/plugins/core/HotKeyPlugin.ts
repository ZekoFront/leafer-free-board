import type EditorCore from "@/core/EditorCore";
import { HOTKEY_TYPE } from "@/core/constants";

export class HotKeyPlugin {
    static pluginName = "HotKeyPlugin";
    static apis = ["selectAll", "cancelSelect"];

    pluginName = HotKeyPlugin.pluginName;
    hotkeys = [HOTKEY_TYPE.SELECT_ALL, HOTKEY_TYPE.CANCEL_SELECT_ALL];
    constructor(public editor: EditorCore) {}

    selectAll = () => {
        this.editor.app.editor.select(this.editor.app.tree.children)
    }

    cancelSelect = () => {
        this.editor.app.editor.cancel()
    }

    hotkeyEvent = (eventName: string, e: KeyboardEvent) => {
        e.preventDefault();
        if (e.type !== "keyup") return;

        if (eventName === HOTKEY_TYPE.SELECT_ALL) {
            this.selectAll()
        }else if (eventName === HOTKEY_TYPE.CANCEL_SELECT_ALL) {
            this.cancelSelect()
        }
    };
}
