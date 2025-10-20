import { UndoManager } from "@/utils/UndoManager";
import type EditorBoard from "../EditorBoard";
import type { IHistory, IPluginOption, IPluginTempl } from "../types";

class HistoryPlugin implements IPluginTempl {
    static pluginName = 'HistoryPlugin';
    static apis = ['undo', 'redo', 'createHistory'];
    static hotkeys: string[]= ['ctrl+z', 'ctrl+y',];
    private undoManager: UndoManager;
    public historyRecords: IHistory[] = [];
    private MAX_HISTORY_SIZE = 20;

    constructor(public editorBoard: EditorBoard, options: IPluginOption) {
        this.MAX_HISTORY_SIZE = Number(options.maxLength) || this.MAX_HISTORY_SIZE
        this.undoManager = new UndoManager();
        // 设置最大撤销步数。默认值：0（无限制）
        this.undoManager.setLimit(this.MAX_HISTORY_SIZE);
    }

    private addHistory(value: IHistory) {
        this.historyRecords.push(value);
        this.forceRender()
    }
    
    private removeHistory(id: string) {
        var i = 0, index = -1;
        for (i = 0; i < this.historyRecords.length; i += 1) {
            const item = this.historyRecords[i] as IHistory;
            if(item && item.id === id) {
                index = i;
            }
        }
        if (index !== -1) {
            this.historyRecords.splice(index, 1);
            this.forceRender()
        }
    }
    
    createHistory(value: IHistory) {
        this.historyRecords.push(value);
        // 若超过最大限制，删除最旧的一条（数组第一条）
        if (this.historyRecords.length > this.MAX_HISTORY_SIZE) {
            // 移除最旧的记录（index=0）
            this.historyRecords.shift();
        }

        this.undoManager.add({
            undo: () => this.removeHistory(value.id||""),
            redo: () => this.addHistory(value)
        });
    }

    private forceRender() {
        if (this.historyRecords.length) {
            const lastItem = this.historyRecords[this.historyRecords.length - 1]
            if (lastItem) {
                const { value } = lastItem
                if (value) {
                    // 清除选中状态
                    this.editorBoard.app.editor.cancel()
                    this.editorBoard.app.tree.set(value)
                    // const selectedId = selectedUI.value.id;
                    // const selectedElement = app.tree.children.find(el => el.id ===selectedId);
                    // if (selectedElement) {
                    //     // 选中元素
                    //     app.editor.select(selectedElement)
                    // }
                }
            }
        }
    }

    undo() {
        const hasUndo = this.undoManager.hasUndo();
        if (hasUndo) {
            this.undoManager.undo();
            console.log("撤销操作后:", this.historyRecords);
        }
    }
    redo() {
       const hasRedo = this.undoManager.hasRedo();
        if (hasRedo) {
            this.undoManager.redo();
            console.log("重做操作后:", this.historyRecords);
        }
    }
}

export default HistoryPlugin;