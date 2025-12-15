import { ExecuteTypeEnum } from "@/editor/types";
import type { IUpdateAttrCommandProps } from "../../types";
import { BaseCommand } from "./BaseCommand";

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