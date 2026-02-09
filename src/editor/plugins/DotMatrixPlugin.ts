import type EditorBoard from "../EditorBoard";
import type { IPluginTempl } from "../types";
import { DotMatrix } from 'leafer-x-dot-matrix'

export class DotMatrixPlugin implements IPluginTempl {
    static pluginName = 'DotMatrixPlugin';
    static apis = [];
    static hotkeys: string[]= [];

    constructor(editorBoard: EditorBoard) {
        // 创建点阵实例
        const dotMatrix = new DotMatrix(editorBoard.app)
        // 启用点阵显示
        dotMatrix.enableDotMatrix(true)
    }
    
    public destroy () {
        DotMatrixPlugin.apis = []
        DotMatrixPlugin.hotkeys = []
    }
}