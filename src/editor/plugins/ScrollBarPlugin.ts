import { ScrollBar } from "leafer-editor";
import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";

export class ScrollBarPlugin implements IPluginTempl {
    static pluginName = 'ScrollBarPlugin';
    static apis = [];
    static hotkeys: string[]= [];

    constructor(editorBoard: EditorBoard) {
        // 启用滚动插件
        new ScrollBar(editorBoard.app)
    }
}