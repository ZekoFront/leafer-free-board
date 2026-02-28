import type { IUIInputData } from 'leafer-ui'
import { BaseCommand } from './BaseCommand'
import type EditorBoard from '@/editor/EditorBoard'
import { ExecuteTypeEnum } from '@/editor/types'

interface IAddElementCommandProps {
    element: IUIInputData
    editorBoard: EditorBoard
    type?: string
    desc?: string
}

// 新增元素命令
export class AddCommand extends BaseCommand {
    private data: IUIInputData
    constructor(props: IAddElementCommandProps) {
        super(props.element.id||"", props.editorBoard, ExecuteTypeEnum.AddElement)
        this.tag = props.element.tag||""
        this.desc = props.desc || `添加元素: ${this.tag}`;
        this.data = props.element.toJSON();
        this.id = this.editorBoard.generateId();
    }

    protected getCustomData() {
        return this.data;
    }

    protected setCustomData(data: any): void {
        this.data = data;
    }

    // 执行（重做）：添加元素
    execute() {
        // 执行前确保数据已解压
        if (this.compressed) {
            this.decompress();
        }
        
        // 利用编辑器已有方法创建并添加元素（保证逻辑一致性）
        // 使用 tag 创建leafer元素@see:https://www.leaferjs.com/ui/guide/basic/display.html#%E4%BD%BF%E7%94%A8-tag
        if (this.data) {
            this.editorBoard.app.tree.add(this.data);
        }
    }

    // 撤销：删除元素
    undo() {
        // 利用编辑器已有方法删除元素
        const element = this.getElement(this.elementId);
        if (element) {
            element.remove();
        }
    }

    redo(): void {
        this.execute()
    }
}