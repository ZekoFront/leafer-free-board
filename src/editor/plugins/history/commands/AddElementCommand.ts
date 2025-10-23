import type { IUIInputData } from 'leafer-ui'
import { BaseCommand } from './BaseCommand.js'
import type EditorBoard from '@/editor/EditorBoard'
import { ExecuteTypeEnum } from '@/editor/types'

interface IAddElementCommandProps {
    element: IUIInputData
    editorBoard: EditorBoard
    type?: string
}

// 新增元素命令
export class AddElementCommand extends BaseCommand {
    private tag: string
    private elementProps: IUIInputData
    static desc: string = '新增元素命令'
    constructor(props: IAddElementCommandProps) {
        super(props.element.id||"", props.editorBoard, ExecuteTypeEnum.AddElement)
        this.tag = props.element.tag||""
        this.elementProps = this.filterElementProperties(props.element);
        // 命令唯一ID
        this.id = this.editorBoard.generateId();
    }

    // 执行（重做）：添加元素
    execute() {
        // 利用编辑器已有方法创建并添加元素（保证逻辑一致性）
        // 使用 tag 创建leafer元素@see:https://www.leaferjs.com/ui/guide/basic/display.html#%E4%BD%BF%E7%94%A8-tag
        if (this.elementProps) {
            this.editorBoard.addLeaferElement(this.elementProps);
        }
    }

    // 撤销：删除元素
    undo() {
        // 利用编辑器已有方法删除元素
        this.editorBoard.removeLeaferElement(this.elementId);
    }

    redo(): void {
        this.execute()
    }

    // 验证命令有效性
    isValid(): boolean {
        const isOk = this.elementId && this.tag;
        return Boolean(isOk)
    }
}