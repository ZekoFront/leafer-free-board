import type { IUIInputData } from 'leafer-ui'
import { BaseCommand } from './BaseCommand.js'
import type EditorBoard from '@/editor/EditorBoard'

interface IAddElementCommandProps {
    element: IUIInputData
    editorBoard: EditorBoard
    type?: string
}

// 新增元素命令
export class AddElementCommand extends BaseCommand {
    private tag: string
    private elementProps: any
    private desc: string
    constructor(props: IAddElementCommandProps) {
        super(props.element.id||"", props.editorBoard, 'add-element')
        this.desc = '新增元素命令'
        this.tag = props.element.tag||""
        this.elementProps = this.filterElementProperties(props.element);
        this.id = this.editorBoard.generateId();
    }

    // 执行（重做）：添加元素
    execute() {
        // 利用编辑器已有方法创建并添加元素（保证逻辑一致性）
        // const element = new LeaferUI[this.tag](this.elementProps);
        // false 不添加到历史记录，避免循环添加
        // this.editor.addElement(element, this.elementId);
    }

    // 撤销：删除元素
    undo() {
        // 利用编辑器已有方法删除元素
        // this.editor.removeElement(this.elementId);
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