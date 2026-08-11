import type EditorCore from "@/core/EditorCore";
import type { IPluginTempl } from "@/core/types";
import type { IUI } from "leafer-ui";
import { debounce } from "lodash-es";
import { HOTKEY_TYPE } from "@/core/constants";

function isEditableTargetFocused(): boolean {
    const el = document.activeElement;
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

/**
 * DeleteHotKeyPlugin — 删除快捷键
 *
 * 删除选中元素前，先通过 ConnectionPlugin 清理关联连线/标签，
 * 再由 HistoryPlugin 的 ChildEvent.REMOVE 自动入栈。
 */
export class DeleteHotKeyPlugin implements IPluginTempl {
    static pluginName = "DeleteHotKeyPlugin";
    static apis = ["deleteNode"];

    pluginName = DeleteHotKeyPlugin.pluginName;
    hotkeys = [HOTKEY_TYPE.BACKSPACE, HOTKEY_TYPE.DELETE_NODE];

    constructor(public editor: EditorCore) {}

    deleteNode() {
        const list = (this.editor.app.editor.list || []) as IUI[];
        if (!list.length) return;

        const targets = [...list];
        this.editor.app.editor.cancel();

        targets.forEach((node) => {
            // 先删拓扑关联的 line/label，再删节点本身
            if (node.id) {
                this.editor.removeConnectionsForNode?.(node.id);
            }
            node.remove?.();
        });
    }

    private _delDebounced = debounce(
        () => {
            this.deleteNode();
        },
        200,
        { leading: true, trailing: false },
    );

    hotkeyEvent = (eventName: string, e: KeyboardEvent) => {
        if (e.type !== "keyup") return;
        if (eventName !== "backspace" && eventName !== "delete") return;
        if (isEditableTargetFocused()) return;

        e.preventDefault();
        this._delDebounced();
    };

    destroy() {
        this._delDebounced.cancel();
    }
}
