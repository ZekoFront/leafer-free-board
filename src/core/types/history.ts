import type { IUIInputData } from "leafer-ui";
import type { ExecuteTypeEnum } from "./enums";

export interface IMoveData {
    id: string;
    old: Record<string, unknown>;
    new: Record<string, unknown>;
}

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
          oldAttrs: Record<string, unknown>;
          newAttrs: Record<string, unknown>;
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
