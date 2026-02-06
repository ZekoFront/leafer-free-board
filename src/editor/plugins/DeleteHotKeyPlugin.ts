import { SelectEvent } from "@/utils";
import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
import type { IUI } from "leafer-ui";
import { debounce } from "lodash-es";

export class DeleteHotKeyPlugin implements IPluginTempl {
    static pluginName = 'DeleteHotKeyPlugin';
    static apis = ['deleteNode'];
    hotkeys: string[]= ['backspace', 'delete'];
    private selectNodes: IUI[] = []
    constructor(public editorBoard: EditorBoard) {
        this._bindListener()
    }

    _bindListener() {
        this.editorBoard.on(SelectEvent.MULTIPLE, this._onMultiple)
        this.editorBoard.on(SelectEvent.SINGLE, this._onSingle)
    }

    _onMultiple = (evt:IUI[]) => {
        this.selectNodes = evt
    }

    _onSingle = (evt:IUI) => {
        this.selectNodes = [evt]
    }

    deleteNode() {
        this.editorBoard.app.editor.cancel()
        if (this.selectNodes.length) {
            this.selectNodes.forEach(node => { node.remove() })
        }
    }

    private _delDebounced = debounce(() => {
        this.deleteNode()
    }, 200, { leading: true, trailing: false })


    hotkeyEvent(eventName: string, e: KeyboardEvent) {
        if (e.type === 'keyup' && (eventName === 'backspace' || eventName === 'delete')) {
            this._delDebounced()
        }
    }

    destroy () {
        this.editorBoard.off(SelectEvent.MULTIPLE, this._onMultiple)
        this.editorBoard.off(SelectEvent.SINGLE, this._onSingle)
        this._delDebounced.cancel()
        this.selectNodes.length = 0
    }
}