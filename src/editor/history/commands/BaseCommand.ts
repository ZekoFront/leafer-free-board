import type { ICommand } from "../interface/ICommand";
import type EditorBoard from "@/editor/EditorBoard";
import { ExecuteTypeEnum, type ExecuteTypes } from "@/editor/types";
import LZString from "lz-string";

export abstract class BaseCommand implements ICommand {
    protected editorBoard: EditorBoard;
    public id: string;
    public type: string;
    protected timestamp: number;
    protected compressed: boolean = false;
    protected compressedData?: string;
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

    protected abstract getCustomData(): any;
    protected abstract setCustomData(data: any): void;

    // 压缩命令数据
    public compress(): void {
        if (this.compressed) return;

        try {
            // 获取子类数据
            const dataToSave = this.getCustomData();
            
            // 序列化并压缩 (如果不用 lz-string，直接用 JSON.stringify)
            const jsonString = JSON.stringify(dataToSave);
            this.compressedData = LZString.compressToUTF16(jsonString);
            
            // 标记为已压缩
            this.compressed = true;

            // 通知子类清理内存（置空原始对象）
            // 注意：我们只清理数据，不清理 editorBoard 引用
            this.setCustomData(null); 
            
        } catch (e) {
            console.error('Command Compress Failed:', e);
        }
    }

    // 恢复命令数据
    public decompress(): void {
        if (!this.compressed || !this.compressedData) return;

        try {
            // 解压 (如果不用 lz-string，直接用 JSON.parse)
            const jsonString = LZString.decompressFromUTF16(this.compressedData);
            if (jsonString) {
                const data = JSON.parse(jsonString);
                
                // 恢复数据到子类
                this.setCustomData(data);
            }

            // 清理压缩数据，释放字符串内存
            this.compressedData = undefined;
            this.compressed = false;
        } catch (e) {
            console.error('Command Decompress Failed:', e);
        }
    }

    // 获取元素
    public getElement(id?: string) {
        return this.editorBoard.getById(id || this.elementId);
    }
}
