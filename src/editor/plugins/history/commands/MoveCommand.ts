import { ExecuteTypeEnum, type IHistoryCommandProps, type IPoint } from "@/editor/types";
import { BaseCommand } from "./BaseCommand";

export class MoveCommand extends BaseCommand {
    static tag: string
    static desc: string
    public oldValue: IPoint
    public newValue: IPoint

    constructor(options: IHistoryCommandProps) {
        super(options.elementId, options.editor, ExecuteTypeEnum.MoveElement);
        MoveCommand.desc = options.desc || "拖拽元素命令"
        MoveCommand.tag = options.tag || ''
        this.oldValue = options.oldXYValue
        this.newValue = options.newXYValue
        // 生成唯一ID
        this.id = this.editorBoard.generateId();
    }

    // 重做用旧属性值
    execute(): void {
        // 批量修改待实现，根据批量element来处理...
        // const element = this.getElement();
        const element = this.editorBoard.app.tree.findId(this.elementId);
        console.log('MoveCommand.execute', element)
        if (element) {
            element.set({
                x: this.newValue.x,
                y: this.newValue.y
            })
        }
    }

    // 撤回用旧属性值
    undo(): void{
        // 批量修改待实现，根据批量element来处理...
        const element = this.getElement();
        if (element) {
            element.set({
                x: this.oldValue.x,
                y: this.oldValue.y
            })
        }
    }
    redo(): void {
        throw new Error("Method not implemented.");
    }

}