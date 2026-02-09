import type { IToolBar } from "@/editor/types";
import { ArrowAngleIcon, CircleIcon, CurveIcon, LineIcon, RectIcon, SelectIcon, TextIcon, DiamondIcon } from "@/assets/icons";

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
        icon: CircleIcon,
        title: '圆形',
        type: 'circle',
        draggable: true
    },
    {
        icon: DiamondIcon,
        title: '菱形',
        type: 'diamond',
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
        title: '直线连线(带箭头)',
        type: 'line',
        draggable: false                       
    },
    {
        icon: CurveIcon,
        title: '曲线连接',
        type: 'curve',
        draggable: false                       
    }
]