import { ExecuteTypeEnum } from "@/editor/types";
import { BaseCommand } from "./BaseCommand";
import type { IMoveData, IMoveCommandProps } from "../../types";

// 移动单个元素命令
export class MoveCommand extends BaseCommand {
    // 核心数据：存储多个元素的变更
    public moveList: IMoveData[] = [];
    constructor(options: IMoveCommandProps) {
        super("", options.editor, ExecuteTypeEnum.MoveElement);
        this.desc = options.desc || `移动 ${options.moveList.length} 个元素`;
        this.tag = options.tag || ''
        this.moveList = options.moveList;
        // 生成唯一ID
        this.id = this.editorBoard.generateId();
    }

    protected getCustomData() {
        return this.moveList;
    }

    protected setCustomData(data: any): void {
        this.moveList = data;
    }

    private updatePosition(type: 'new' | 'old') {
        this.editorBoard.cancelSelected()
        // 遍历列表，批量更新
        this.moveList.forEach(item => {
            // 通过 ID 查找元素
            const element = this.getElement(item.id);
            if (element) {
                // 根据类型取值
                // const pos = type === 'new' ? item.new : item.old;
                // LeaferJS 的 set 方法支持部分更新
                // element.set({ x: pos.x, y: pos.y });
                const props = type === 'new' ? item.new : item.old;
                // LeaferJS 的 element.set() 支持传入 Partial<IUIInputData>
                // 这样无论是 x/y 变化，还是 points/path 变化，都能统一处理
                element.set(props);
            }
        });
    }

    // 重做用新属性值
    execute(): void {
       this.updatePosition('new');
    }

    // 撤回用旧属性值
    undo(): void{
        this.updatePosition('old');
    }

    // 重做
    redo(): void {
        this.execute();
    }

}