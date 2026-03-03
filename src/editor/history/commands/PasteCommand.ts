import type EditorBoard from "@/editor/EditorBoard";
import { BaseCommand } from "./BaseCommand";
import type { IUIInputData } from "leafer-ui";
import { ExecuteTypeEnum } from "@/editor/types";

interface IPasteCommandProps {
    elementIds: string[];
    editorBoard: EditorBoard;
    type?: string;
    desc?: string;
}

export class PasteCommand extends BaseCommand {
    private dataList: IUIInputData[] = [];
    private targetIds: string[] = [];

    constructor(props: IPasteCommandProps) {
        super(props.elementIds.join(","), props.editorBoard, ExecuteTypeEnum.Paste);

        this.id = this.editorBoard.generateId();
        this.desc = props.desc || `批量粘贴元素 (${props.elementIds.length}个)`;
        this.targetIds = props.elementIds;

        this.targetIds.forEach(id => {
            const element = this.getElement(id);
            if (element) {
                this.dataList.push(element.toJSON())
            }
        });

    }

    execute(): void {
        if (this.dataList.length > 0) {
            this.editorBoard.app.tree.add(this.dataList);
        }
    }

    // 撤销:删除新增元素
    undo(): void {
        if (this.compressed) this.decompress();
        this.dataList.forEach(item => {
            if (item.id) {
                const element = this.editorBoard.getById(item.id);
                if (element) element.remove()
            }
        });
    }

    redo(): void {
        this.execute()
    }

    protected getCustomData() {
        return this.dataList;
    }

    protected setCustomData(data: any): void {
        this.dataList = data;
    }
    
}
