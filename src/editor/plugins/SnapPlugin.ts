import { Snap } from "leafer-x-easy-snap";
import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";

class SnapPlugin implements IPluginTempl {
    static pluginName = 'SnapPlugin';
    static apis = [];
    static hotkeys: string[]= [];

    constructor(editorBoard: EditorBoard) {
        // 启用easy-snap吸附插件
        const snap = new Snap(editorBoard.app)
        snap.enable(true)
    }
}

export default SnapPlugin