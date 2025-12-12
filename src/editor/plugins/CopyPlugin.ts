import { SelectEvent } from "@/utils";
import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
import type { IUI } from "leafer-ui";
import { debounce } from "lodash-es";

export class CopyPlugin implements IPluginTempl {
    static pluginName = 'CopyPlugin';
    static apis = [];
    hotkeys: string[]= ['ctrl+c', 'ctrl+v'];
    private selectNodes: IUI[] = []
    private copyNodes: IUI[] = []
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

    _copy() {
        if (this.selectNodes.length) {
            this.selectNodes.forEach(node => {
                const clone = node.clone()
                clone.set({ x: clone.x || 0 + 50, y: clone.y || 0 + 50 })
                this.copyNodes.push(clone)
            })
        }
        console.log('copy')
    }

    _paste () {
        if (this.copyNodes.length) {
            this.copyNodes.forEach(node => {
                this.editorBoard.addLeaferElement(node)
            })
            this.copyNodes.length = 0
        }
    }

    private _copyDebounced = debounce(() => {
        this._copy()
    }, 200, { leading: true, trailing: false })


    private _pasteDebounced = debounce(() => {
        this._paste()
    }, 200, { leading: true, trailing: false })

    hotkeyEvent(eventName: string, e: KeyboardEvent) {
        if (e.type === 'keyup' && (eventName === 'ctrl+c')) {
            this._copyDebounced()
        } else if (e.type === 'keyup' && (eventName === 'ctrl+v')) {
            this._pasteDebounced()
        }
    }

    destroy () {
        this.editorBoard.off(SelectEvent.MULTIPLE, this._onMultiple)
        this.editorBoard.off(SelectEvent.SINGLE, this._onSingle)
        this._copyDebounced.cancel()
        this.selectNodes.length = 0
    }
}