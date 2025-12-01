import type { IToolBar } from "@/editor/types";
import { ArrowAngleIcon, LineIcon, RectIcon, SelectIcon, TextIcon } from "@/icons";

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
        icon: ArrowAngleIcon,
        title: '箭头',
        type: 'arrow',
        draggable: false                       
    },
    {
        icon: LineIcon,
        title: '连线',
        type: 'line',
        draggable: false                       
    }
]