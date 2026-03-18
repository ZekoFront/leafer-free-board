import { isEqual } from "lodash-es";
import type { ICommand } from "./interface/ICommand";
import {
    ExecuteTypeEnum,
    type HistoryAction,
    type IPluginOption,
    type IPluginTempl,
} from "@/editor/types";
import { AddCommand, DeleteCommand, MoveCommand, PasteCommand, UpdateAttrCommand } from "./index";
import type EditorBoard from "@/editor/EditorBoard";
import { HistoryEvent } from "@/editor/utils";

// 历史记录管理器 - 核心撤销重做逻辑
export class HistoryManager implements IPluginTempl {
    static pluginName: string = "HistoryManager";
    static events: string[] = [];
    static apis: string[] = [];
    private maxHistorySize: number;
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    constructor(
        public editorBoard: EditorBoard,
        options: IPluginOption,
    ) {
        this.maxHistorySize = Number(options.maxHistorySize) || 50;
        this.undoStack = [];
        this.redoStack = [];
    }

    execute(action: HistoryAction) {
        try {
            let command: ICommand;

            switch (action.executeType) {
                case ExecuteTypeEnum.AddElement:
                    action.element.type = ExecuteTypeEnum.AddElement;
                    command = new AddCommand({
                        element: action.element,
                        editorBoard: this.editorBoard,
                    });
                    break;

                case ExecuteTypeEnum.MoveElement:
                    command = new MoveCommand({
                        moveList: action.moveList,
                        tag: action.tag || "",
                        editor: this.editorBoard,
                    });
                    break;

                case ExecuteTypeEnum.UpdateAttribute:
                    command = new UpdateAttrCommand({
                        elementId: action.elementId,
                        editor: this.editorBoard,
                        oldAttrs: action.oldAttrs,
                        newAttrs: action.newAttrs,
                        tag: action.tag || "",
                        childId: action.childId || "",
                    });
                    break;

                case ExecuteTypeEnum.DeleteElement:
                    command = new DeleteCommand({
                        elementIds: action.elementIds,
                        editorBoard: this.editorBoard,
                    });
                    break;

                case ExecuteTypeEnum.Paste:
                    command = new PasteCommand({
                        elementIds: action.elementIds,
                        editorBoard: this.editorBoard,
                    });
                    break;
            }

            this.addCommand(command);
        } catch (err) {
            console.error(`[HistoryManager] execute 失败 (${action.executeType}):`, err);
        }
    }

    // 通用命令
    private addCommand(command: ICommand) {
        // 存入命令也需要对比是否存在同样的命令，有只存储一个即可，保证命令唯一性
        const isExied = this.undoStack.some((el) => {
            return isEqual(el, command);
        });

        // 新命令
        if (!isExied) {
            command.compress();
            this.undoStack.push(command);
        }

        // 清空重做栈
        this.redoStack = [];

        // 限制历史记录大小
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }

        this.editorBoard.emit(HistoryEvent.CHANGE, this.state());
    }

    undo() {
        if (!this.canUndo()) return;
        const command = this.undoStack.pop()!;
        try {
            command.decompress();
            command.undo();
            this.redoStack.push(command);
        } catch (err) {
            console.error("[HistoryManager] undo 失败:", err);
        }
        this.editorBoard.emit(HistoryEvent.CHANGE, this.state());
    }

    redo() {
        if (!this.canRedo()) return;
        const command = this.redoStack.pop()!;
        try {
            command.decompress();
            command.redo();
            this.undoStack.push(command);
        } catch (err) {
            console.error("[HistoryManager] redo 失败:", err);
        }
        this.editorBoard.emit(HistoryEvent.CHANGE, this.state());
    }

    // 检查是否可以撤销
    canUndo() {
        return this.undoStack.length > 0;
    }

    // 检查是否可以重做
    canRedo() {
        return this.redoStack.length > 0;
    }

    // 清空
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // 清空历史记录
    destroy() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // 获取历史记录信息（用于UI显示）
    state() {
        return {
            undoStack: this.undoStack,
            redoStack: this.redoStack,
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
        };
    }
}
