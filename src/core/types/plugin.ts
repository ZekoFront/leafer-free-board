import type EditorCore from "../EditorCore";

export interface IPluginOption {
    [key: string]: unknown;
}

export interface IPluginTempl {
    pluginName: string;
    events?: string[];
    apis?: string[];
    hotkeys?: string[];
    hotkeyEvent?: (name: string, e: KeyboardEvent) => void;
    destroy?: () => void;
}

export interface IPluginClass {
    pluginName: string;
    events?: string[];
    apis?: string[];
    hotkeys?: string[];
    new (editor: EditorCore, options?: IPluginOption): IPluginTempl;
}
