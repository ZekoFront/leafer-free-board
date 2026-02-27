import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
// import { Ruler } from "leafer-x-ruler";

export class RulerPlugin implements IPluginTempl {
    static pluginName = 'RulerPlugin';
    static apis = [];
    static hotkeys: string[]= [];

    constructor(editorBoard: EditorBoard) {
        // 实例化标尺插件
        // const ruler = new Ruler(editorBoard.app as any)
        // ruler.enabled = true
    }
    
    public destroy () {
        RulerPlugin.apis = []
        RulerPlugin.hotkeys = []
    }
}