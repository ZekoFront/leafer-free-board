import type { IPointData } from "leafer-ui";
import type EditorBoard from "../EditorBoard";

export interface IEditorBoard extends EditorBoard {}

// 插件实例
export declare class IPluginTempl {
    constructor(ceditor: IEditorBoard, options?: IPluginOption);
    static pluginName: string;
    static events: string[];
    static apis: string[];
    static hotkeys: string[];
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

export type ExecuteTypes = 'add-element' | 'delete-element' | 'update-element' | 'move-element' | 'multi-movale-element';

export enum ExecuteTypeEnum {
  AddElement = 'add-element',
  DeleteElement = 'delete-element',
  UpdateElement = 'update-element',
  MoveElement = 'move-element',
  BaseCommand = 'base-command',
  MultiDragElement = "multi-movale-element",
}

export interface IHistoryCommandProps {
   elementId:string
   tag: string 
   editor: EditorBoard
   oldXYValue: IPointData
   newXYValue: IPointData
   desc?: string
}

type OptionsType = {
    label: string
    key: string
}
export interface IToolBar {
    icon: any
    title: string
    type: string
    draggable?: boolean
    options?: OptionsType[]
}


export interface IDrawState {
    type: string;
    state: string;
}

export interface IPointItem {
    x: number;
    y: number;
    dirX: number;
    dirY: number;
}
