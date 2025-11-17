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
        draggable: false,
        options: [
            {
                label: '标准箭头',
                key: 'arrow'
            },
            {
                label: '角度箭头',
                key: 'angle'
            },
            {
                label: '单边角度箭头',
                key: 'angle-side'
            },
            {
                label: '三角形箭头',
                key: 'triangle'
            },
            {
                label: '反向三角形箭头',
                key: 'triangle-flip'
            },
            {
                label: '圆形箭头',
                key: 'circle'
            },
            {
                label: '圆形箭头（线性）',
                key: 'circle-line'
            },
            {
                label: '方形箭头',
                key: 'square'
            },
            {
                label: '方形箭头（线性）',
                key: 'square-line'
            },
            {
                label: '菱形箭头',
                key: 'diamond'
            },
            {
                label: '菱形箭头（线性）',
                key: 'diamond-line'
            },
            {
                label: '标注箭头',
                key: 'mark'
            }
        ]                        
    }
]