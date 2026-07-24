import type EditorCore from "@/core/EditorCore";
import type { IPluginTempl } from "@/core/types";
import type { IUI } from "leafer-ui";
import { debounce } from "lodash-es";

function isEditableTargetFocused(): boolean {
    const el = document.activeElement;
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

/**
 * DeleteHotKeyPlugin — 删除快捷键插件
 *
 * 监听 Backspace / Delete，删除 editor.app.editor.list 中的选中元素。
 * 删除由 HistoryPlugin 通过 ChildEvent.REMOVE 自动入栈，支持撤销。
 */
export class DeleteHotKeyPlugin implements IPluginTempl {
    static pluginName = "DeleteHotKeyPlugin";
    static apis = ["deleteNode"];

    pluginName = DeleteHotKeyPlugin.pluginName;
    hotkeys = ["backspace", "delete"];

    constructor(public editor: EditorCore) {}

    /** 删除当前选中元素（供快捷键与 UI 调用） */
    deleteNode() {
        const list = (this.editor.app.editor.list || []) as IUI[];
        if (!list.length) return;

        const targets = [...list];
        this.editor.app.editor.cancel();

        targets.forEach((node) => {
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
