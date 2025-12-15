// src/history/commands/BaseCommand.ts
import type { ICommand } from "../interface/ICommand";
import type EditorBoard from "@/editor/EditorBoard";
import { ExecuteTypeEnum, type ExecuteTypes } from "@/editor/types";

export abstract class BaseCommand implements ICommand {
    protected editorBoard: EditorBoard;
    public id: string;
    public type: string;
    protected timestamp: number;
    protected compressed: boolean = false;
    protected compressedData?: any;
    public elementId: string;
    public tag: string;
    public desc: string;

    constructor(
        elementId: string,
        editorBoard: EditorBoard,
        executeType?: ExecuteTypes,
        tag?: string,
        desc?: string
    ) {
        this.editorBoard = editorBoard;
        this.type = executeType || ExecuteTypeEnum.BaseCommand;
        this.elementId = elementId;
        this.id = this.editorBoard.generateId();
        this.timestamp = Date.now();
        this.tag = tag || "";
        this.desc = desc || "";
    }

    abstract execute(): void;
    abstract undo(): void;
    abstract redo(): void;

    // 压缩命令数据
    public compress(): void {
        if (!this.compressed) {
            this.compressedData = JSON.stringify(this);
            // 清空原始数据以节省内存
            Object.keys(this).forEach((key) => {
                if (
                    key !== "id" &&
                    key !== "type" &&
                    key !== "compressed" &&
                    key !== "compressedData"
                ) {
                    // @ts-ignore
                    delete this[key];
                }
            });
            this.compressed = true;
        }
    }

    // 恢复命令数据
    public decompress(): void {
        if (this.compressed && this.compressedData) {
            const data = JSON.parse(this.compressedData);
            Object.assign(this, data);
            this.compressed = false;
            this.compressedData = undefined;
        }
    }

    // 获取元素
    public getElement(id?: string) {
        return this.editorBoard.getById(id || this.elementId);
    }
}
