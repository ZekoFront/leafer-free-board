import type { EditorBoard } from "@/editor"
import type { IPointData } from "leafer-ui"


export interface IHistoryCommandProps {
   elementId:string
   tag: string 
   editor: EditorBoard
   oldXYValue: IPointData
   newXYValue: IPointData
   desc?: string
}


export interface IMoveData {
    id: string
    old: {
        x: number
        y: number
    }
    new: {
        x: number
        y: number
    }
}

export type ExecuteTypes = 'add-element' | 'delete-element' | 'update-attribute' | 'move-element' | 'multi-movale-element';

export interface IMoveCommandProps extends Omit<IHistoryCommandProps, 'elementId' | 'oldXYValue' | 'newXYValue'> {
    moveList: IMoveData[]; 
}

export interface IUpdateAttrCommandProps {
    editor: EditorBoard;
    elementId: string;
    // 使用 Record<string, any> 来支持任意属性 (width, fill, shadow...)
    oldAttrs: Record<string, any>; 
    newAttrs: Record<string, any>;
    tag?: string;
    desc?: string;
}