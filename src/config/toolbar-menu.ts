import type { IToolBar } from "@/core/types";
import {
    ArrowAngleIcon,
    CircleIcon,
    CurveIcon,
    DiamondIcon,
    EllipseIcon,
    LineIcon,
    PaintbrushIcon,
    RectIcon,
    SelectIcon,
    TextIcon,
} from "@/assets/icons";

export const toolbarMenu: IToolBar[] = [
    { icon: SelectIcon, title: "选择", type: "select", draggable: false },
    { icon: RectIcon, title: "矩形", type: "rect", draggable: true },
    { icon: CircleIcon, title: "圆形", type: "circle", draggable: true },
    { icon: EllipseIcon, title: "椭圆", type: "ellipse", draggable: true },
    { icon: DiamondIcon, title: "菱形", type: "diamond", draggable: true },
    { icon: TextIcon, title: "文本", type: "text", draggable: true },
    { icon: ArrowAngleIcon, title: "箭头", type: "arrow", draggable: false },
    { icon: LineIcon, title: "直线连线(带箭头)", type: "line", draggable: false },
    { icon: CurveIcon, title: "曲线连接", type: "curve", draggable: false },
    { icon: PaintbrushIcon, title: "画笔", type: "paintbrush", draggable: false },
];
