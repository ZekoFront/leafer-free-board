import type { EditorBoard } from "@/editor";
import type { IPointData, IUIInputData } from "leafer-ui";
import { ExecuteTypeEnum } from "./enums";

export interface IHistoryCommandProps {
    elementId: string;
    tag: string;
    editor: EditorBoard;
    oldXYValue: IPointData;
    newXYValue: IPointData;
    desc?: string;
}

export interface IMoveData {
    id: string;
    old: Record<string, any>;
    new: Record<string, any>;
}

export type ExecuteTypes =
    | "paste-element"
    | "add-element"
    | "delete-element"
    | "update-attribute"
    | "move-element"
    | "multi-movale-element";

export interface IMoveCommandProps extends Omit<
    IHistoryCommandProps,
    "elementId" | "oldXYValue" | "newXYValue"
> {
    moveList: IMoveData[];
}

export interface IUpdateAttrCommandProps {
    editor: EditorBoard;
    elementId: string;
    oldAttrs: Record<string, any>;
    newAttrs: Record<string, any>;
    tag?: string;
    desc?: string;
    childId?: string;
}

/** 序列化的连线数据 */
export interface ISerializedConnection {
    fromId: string;
    toId: string;
    lineId: string;
    labelId?: string;
    labelText?: string;
}

/** 序列化的历史命令 */
export interface ISerializedCommand {
    type: string;
    id: string;
    elementId: string;
    tag: string;
    desc: string;
    childId: string;
    customData: any;
    oldAttrs?: Record<string, any>;
    newAttrs?: Record<string, any>;
    targetIds?: string[];
}

/** 画板完整快照 */
export interface IBoardSnapshot {
    canvas: any[];
    connections: ISerializedConnection[];
    history: {
        undoStack: ISerializedCommand[];
        redoStack: ISerializedCommand[];
    };
    version: number;
    timestamp: number;
}

/** execute() 的判别联合参数类型，按 executeType 区分 */
export type HistoryAction =
    | {
          executeType: ExecuteTypeEnum.AddElement;
          element: IUIInputData;
      }
    | {
          executeType: ExecuteTypeEnum.MoveElement;
          moveList: IMoveData[];
          tag?: string;
      }
    | {
          executeType: ExecuteTypeEnum.UpdateAttribute;
          elementId: string;
          oldAttrs: Record<string, any>;
          newAttrs: Record<string, any>;
          tag?: string;
          childId?: string;
      }
    | {
          executeType: ExecuteTypeEnum.DeleteElement;
          elementIds: string[];
      }
    | {
          executeType: ExecuteTypeEnum.Paste;
          elementIds: string[];
      };
