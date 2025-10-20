import type { App, IUIJSONData } from "leafer-ui";
import type EditorBoard from "../EditorBoard";

export interface IEditorBoard extends EditorBoard { }

export interface IEditorBoardPlugin {
    init: <T>(app: App) => T
}


// 插件实例
export declare class IPluginTempl {
    constructor(ceditor: IEditorBoard, options?: IPluginOption);
    static pluginName: string;
    static events: string[];
    static apis: string[];
    hotkeyEvent?: (name: string, e: KeyboardEvent) => void;
    [propName: string]: any;
    editor?: IEditorBoard;
}

export declare interface IPluginOption {
    [propName: string]: unknown | undefined;
}


declare class IPluginClass2 extends IPluginTempl {
  constructor();
}

// 插件class
export declare interface IPluginClass {
  new (editor: EditorBoard, options?: IPluginOption): IPluginClass2;
}

// 实例化撤销管理器
export interface IHistory {
    id: string,
    value: IUIJSONData
}