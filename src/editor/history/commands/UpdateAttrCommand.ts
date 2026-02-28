import { ExecuteTypeEnum } from "@/editor/types";
import type { IUpdateAttrCommandProps } from "../../types";
import { BaseCommand } from "./BaseCommand";

// 更新属性命令
export class UpdateAttrCommand extends BaseCommand {
    // 存储变更前后的属性键值对
    // 例如: { fill: "#FF0000", width: 100 }
    public oldAttrs: Record<string, any>;
    public newAttrs: Record<string, any>;

    constructor(props: IUpdateAttrCommandProps) {
        super(props.elementId, props.editor, ExecuteTypeEnum.UpdateAttribute)
        this.oldAttrs = props.oldAttrs;
        this.newAttrs = props.newAttrs;

        this.tag = props.tag || '';
        const keys = Object.keys(props.newAttrs).join(', ');
        this.desc = props.desc || `修改元素属性: ${keys}`;
    }

    // 重写 compress 方法, 直接 return，阻断父类的压缩逻辑，防止数据被置空
    public override compress(): void {
        return
    }

    // 重写 decompress 方法, 对应地，也不需要解压
    public override decompress(): void {
        return
    }

    protected getCustomData() {
        return null;
    }
    protected setCustomData(): void {
    }

    execute(): void {
        const element = this.getElement()
        if (element) {
            element.set(this.newAttrs)
        }
    }

    undo(): void {
        const element = this.getElement()
        if (element) {
            element.set(this.oldAttrs)
        }
    }

    redo(): void {
        this.execute()    
    }
    
}