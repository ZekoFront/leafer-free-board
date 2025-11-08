import type { IToolBar } from "@/editor/types";
import { ArrowIcon, RectIcon, SelectIcon, TextIcon } from "@/icons";

export const toolbars: IToolBar[] = [
    {
        icon: SelectIcon,
        title: '选择',
        type: 'select'
    },
    {
        icon: RectIcon,
        title: '矩形',
        type: 'rect'
    },
    {
        icon: TextIcon,
        title: '文本',
        type: 'text'                        
    },
    {
        icon: ArrowIcon,
        title: '箭头',
        type: 'arrow'                        
    }
]