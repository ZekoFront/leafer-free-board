import type EditorBoard from "@/editor/EditorBoard";
import { BaseCommand } from "./BaseCommand";
import { ExecuteTypeEnum } from "@/editor/types";

interface IMultiDragElementState {
    elementId: string
    startX: number
    startY: number
    endX: number
    endY: number
    editor: EditorBoard
}

export class MultiDragCommand extends BaseCommand {
    // 所有被拖拽元素的状态集合
    private dragStates: IMultiDragElementState[] = [] 
    static desc: string = '批量拖拽元素命令';
    constructor(editorBoard: EditorBoard, dragStates: IMultiDragElementState[]) {
        super('', editorBoard, ExecuteTypeEnum.MultiDragElement);
        this.dragStates = [...dragStates]
        // 生成唯一ID
        this.id = this.editorBoard.generateId();
    }

    execute(): void {
        throw new Error("Method not implemented.");
    }
    undo(): void {
        throw new Error("Method not implemented.");
    }
    redo(): void {
        throw new Error("Method not implemented.");
    }

    isValid(): boolean {
        return this.dragStates.length > 0;
    }
    
}