import { SelectEvent } from "@/utils";
import type EditorBoard from "../EditorBoard";
import { ExecuteTypeEnum, type IPluginTempl } from "../types";
import type { IUI } from "leafer-ui";
import { debounce, cloneDeep } from "lodash-es";

export class CopyPlugin implements IPluginTempl {
    static pluginName = "CopyPlugin";
    static apis = ['copyNode'];
    hotkeys: string[] = ["ctrl+c", "ctrl+v"];
    private selectNodes: IUI[] = [];
    private copyNodes: IUI[] = [];
    constructor(public editorBoard: EditorBoard) {
        this._bindListener();
    }

    _bindListener() {
        this.editorBoard.on(SelectEvent.MULTIPLE, this._onMultiple);
        this.editorBoard.on(SelectEvent.SINGLE, this._onSingle);
    }

    _onMultiple = (evt: IUI[]) => {
        this.selectNodes = cloneDeep(evt);
    };

    _onSingle = (evt: IUI) => {
        this.selectNodes = cloneDeep([evt]);
    };

    private _copy() {
        if (this.selectNodes.length) {
            this.selectNodes.forEach((node) => {
                const clone = node.clone();
                clone.set({
                    x: (node.x || 0) + 50,
                    y: (node.y || 0) + 50,
                    id: this.editorBoard.generateId(),
                });
                clone.data &&
                    (clone.data.executeType = ExecuteTypeEnum.AddElement);
                this.copyNodes.push(clone);
            });
        }
    }

    private _paste() {
        if (this.copyNodes.length) {
            this.copyNodes.forEach((node) => {
                this.editorBoard.addLeaferElement(node);
                // this.editorBoard.history.execute(node);
            });

            // 选择元素
            this.editorBoard.app.editor.select(this.copyNodes);

            // 添加历史记录
            this.editorBoard.history.execute({
                elementIds: this.copyNodes.map((node) => node.id),
                editorBoard: this.editorBoard,
                data: {
                    executeType: ExecuteTypeEnum.Paste,
                },
            });

            this.copyNodes.length = 0;
        }
    }

    copyNode() {
        this._copyDebounced();
        this._pasteDebounced();
    }

    private _copyDebounced = debounce(
        () => {
            this._copy();
        },
        200,
        { leading: true, trailing: false },
    );

    private _pasteDebounced = debounce(
        () => {
            this._paste();
        },
        200,
        { leading: true, trailing: false },
    );

    hotkeyEvent(eventName: string, e: KeyboardEvent) {
        if (e.type === "keyup" && eventName === "ctrl+c") {
            this._copyDebounced();
        } else if (e.type === "keyup" && eventName === "ctrl+v") {
            this._pasteDebounced();
        }
    }

    destroy() {
        this.editorBoard.off(SelectEvent.MULTIPLE, this._onMultiple);
        this.editorBoard.off(SelectEvent.SINGLE, this._onSingle);
        this._copyDebounced.cancel();
        this.selectNodes.length = 0;
    }
}
