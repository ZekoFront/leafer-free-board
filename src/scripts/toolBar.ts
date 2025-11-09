import type { IToolBar } from "@/editor/types";
import { ArrowIcon, RectIcon, SelectIcon, TextIcon } from "@/icons";

export const toolbars: IToolBar[] = [
    {
        icon: SelectIcon,
        title: '选择',
        type: 'select',
        draggable: false
    },
    {
        icon: RectIcon,
        title: '矩形',
        type: 'rect',
        draggable: true
    },
    {
        icon: TextIcon,
        title: '文本',
        type: 'text',
        draggable: true                        
    },
    {
        icon: ArrowIcon,
        title: '箭头',
        type: 'arrow',
        draggable: false                        
    }
]