import type EditorBoard from "@/editor/EditorBoard";
import { BaseCommand } from "./BaseCommand";
import { ExecuteTypeEnum } from "@/editor/types";
import type { IUIInputData } from "leafer-ui";

interface IRemoveElementCommandProps {
    elementIds: string[];
    editorBoard: EditorBoard;
    type?: string;
    desc?: string;
}

interface IDeletedItem {
    parentId: string;
    data: IUIInputData;
}

// 删除命令
export class DeleteCommand extends BaseCommand {
    private items: IDeletedItem[] = [];
    private targetIds: string[] = [];
    
    constructor(props: IRemoveElementCommandProps) {
        super(
            props.elementIds.join(','),
            props.editorBoard,
            ExecuteTypeEnum.DeleteElement
        );
        
        this.targetIds = props.elementIds;
        this.desc = props.desc || `批量删除元素 (${props.elementIds.length}个)`;

        this.id = this.editorBoard.generateId();
        // 在删除前，预先收集所有元素的数据和父级关系
        this.targetIds.forEach(id => {
            const element = this.getElement(id);
            if (element) {
                // 记录关键信息
                this.items.push({
                    parentId: element.parent ? element.parent.innerId : '',
                    data: element.toJSON()
                });
            }
        });
        
        if (this.items.length === 0) {
            console.warn('RemoveCommand: No valid elements found to delete.');
        }
    }

    protected getCustomData() {
        return this.items;
    }

    protected setCustomData(data: any): void {
       this.items = data;
    }

    execute(): void {
        if (!this.targetIds.length) return;

        this.targetIds.forEach(id => {
            const element = this.getElement(id);
            if (element) {
                element.remove();
            }
        });
    }
    
    // 撤销：恢复被删除的元素
    undo(): void {
        // 确保数据可用（如果被压缩过，需要解压）
        if (this.compressed) {
            this.decompress();
        }

        this.items.forEach(item => {
            if (!item.data) return;

            let parent;
            if (item.parentId) {
                parent = this.editorBoard.app.tree.findOne(item.parentId)
            }

            if (!parent) {
                parent = this.editorBoard.app.tree;
            }

            if (parent) {
                parent.add(item.data);
            }
        });
    }

    // 重做：重新删除元素
    redo(): void {
        this.execute();
    }

}
