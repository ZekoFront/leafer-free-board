import { isEqual } from "lodash-es";
import type { ICommand } from "./interface/ICommand";
import {
    ExecuteTypeEnum,
    type HistoryAction,
    type ISerializedCommand,
    type IPluginOption,
    type IPluginTempl,
} from "@/editor/types";
import { AddCommand, DeleteCommand, MoveCommand, PasteCommand, UpdateAttrCommand } from "./index";
import { BaseCommand } from "./commands/BaseCommand";
import type EditorBoard from "@/editor/EditorBoard";
import { HistoryEvent } from "@/editor/utils";

// 历史记录管理器 - 核心撤销重做逻辑
export class HistoryManager implements IPluginTempl {
    static pluginName: string = "HistoryManager";
    static events: string[] = [];
    static apis: string[] = [];
    public isPerformingAction = false;
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
        this.isPerformingAction = true;
        try {
            command.decompress();
            command.undo();
            this.redoStack.push(command);
        } catch (err) {
            console.error("[HistoryManager] undo 失败:", err);
        } finally {
            this.isPerformingAction = false;
        }
        this.editorBoard.emit(HistoryEvent.CHANGE, this.state());
    }

    redo() {
        if (!this.canRedo()) return;
        const command = this.redoStack.pop()!;
        this.isPerformingAction = true;
        try {
            command.decompress();
            command.redo();
            this.undoStack.push(command);
        } catch (err) {
            console.error("[HistoryManager] redo 失败:", err);
        } finally {
            this.isPerformingAction = false;
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

    saveState(): { undoStack: ISerializedCommand[]; redoStack: ISerializedCommand[] } {
        return {
            undoStack: this.undoStack.map((cmd) => this._serializeCommand(cmd)),
            redoStack: this.redoStack.map((cmd) => this._serializeCommand(cmd)),
        };
    }

    restoreState(data: { undoStack: ISerializedCommand[]; redoStack: ISerializedCommand[] }) {
        this.undoStack = data.undoStack
            .map((s) => this._deserializeCommand(s))
            .filter(Boolean) as ICommand[];
        this.redoStack = data.redoStack
            .map((s) => this._deserializeCommand(s))
            .filter(Boolean) as ICommand[];
        this.editorBoard.emit(HistoryEvent.CHANGE, this.state());
    }

    private _serializeCommand(cmd: ICommand): ISerializedCommand {
        const base = cmd as BaseCommand;
        const result: ISerializedCommand = {
            type: base.type,
            id: base.id,
            elementId: base.elementId,
            tag: base.tag,
            desc: base.desc,
            childId: base.childId,
            customData: base.serializeCustomData(),
        };

        if (base.type === ExecuteTypeEnum.UpdateAttribute) {
            const uCmd = cmd as UpdateAttrCommand;
            result.oldAttrs = uCmd.oldAttrs;
            result.newAttrs = uCmd.newAttrs;
        }

        if (base.type === ExecuteTypeEnum.DeleteElement || base.type === ExecuteTypeEnum.Paste) {
            result.targetIds = (cmd as any).targetIds;
        }

        return result;
    }

    private _deserializeCommand(data: ISerializedCommand): ICommand | null {
        try {
            let cmd: BaseCommand;

            switch (data.type) {
                case ExecuteTypeEnum.AddElement:
                    cmd = Object.create(AddCommand.prototype);
                    break;
                case ExecuteTypeEnum.MoveElement:
                    cmd = Object.create(MoveCommand.prototype);
                    break;
                case ExecuteTypeEnum.UpdateAttribute:
                    cmd = Object.create(UpdateAttrCommand.prototype);
                    (cmd as any).oldAttrs = data.oldAttrs;
                    (cmd as any).newAttrs = data.newAttrs;
                    break;
                case ExecuteTypeEnum.DeleteElement:
                    cmd = Object.create(DeleteCommand.prototype);
                    (cmd as any).targetIds = data.targetIds || [];
                    (cmd as any).items = [];
                    break;
                case ExecuteTypeEnum.Paste:
                    cmd = Object.create(PasteCommand.prototype);
                    (cmd as any).targetIds = data.targetIds || [];
                    (cmd as any).dataList = [];
                    break;
                default:
                    return null;
            }

            (cmd as any).editorBoard = this.editorBoard;
            cmd.type = data.type;
            cmd.id = data.id;
            cmd.elementId = data.elementId;
            cmd.tag = data.tag;
            cmd.desc = data.desc;
            cmd.childId = data.childId;
            (cmd as any).timestamp = Date.now();
            (cmd as any).compressed = false;

            if (data.customData != null) {
                cmd.restoreCustomData(data.customData);
            }

            return cmd;
        } catch (err) {
            console.error("[HistoryManager] 反序列化命令失败:", err);
            return null;
        }
    }
}
