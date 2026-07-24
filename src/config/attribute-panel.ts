import {
    arrowIcon,
    angleIcon,
    angleSideIcon,
    triangleIcon,
    triangleFlipIcon,
    circleIcon,
    circleLineIcon,
    squareIcon,
    squareLineIcon,
    diamondIcon,
    diamondLineIcon,
    markIcon,
} from "@/assets/arrow";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@/assets/icons";

export const arrowTypes = [
    { label: "标准箭头", key: "arrow", icon: arrowIcon },
    { label: "角度箭头", key: "angle", icon: angleIcon },
    { label: "单边角度箭头", key: "angle-side", icon: angleSideIcon },
    { label: "三角形箭头", key: "triangle", icon: triangleIcon },
    { label: "反向三角形箭头", key: "triangle-flip", icon: triangleFlipIcon },
    { label: "圆形箭头", key: "circle", icon: circleIcon },
    { label: "圆形箭头(线性)", key: "circle-line", icon: circleLineIcon },
    { label: "方形箭头", key: "square", icon: squareIcon },
    { label: "方形箭头(线性)", key: "square-line", icon: squareLineIcon },
    { label: "菱形箭头", key: "diamond", icon: diamondIcon },
    { label: "菱形箭头(线性)", key: "diamond-line", icon: diamondLineIcon },
    { label: "标注箭头", key: "mark", icon: markIcon },
];

export const colorPanel = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
    "#fca5a5", "#fed7aa", "#fde68a", "#bbf7d0", "#99f6e4",
    "#bae6fd", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8",
    "#1f2937", "#6b7280", "#d1d5db", "#ffffff",
];

export const strokeColorList = [
    "#1f2937",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#6366f1",
];

export const fontStyleList = [
    { label: "粗体", value: "bold", icon: BoldIcon },
    { label: "斜体", value: "italic", icon: ItalicIcon },
    { label: "下划线", value: "under", icon: UnderlineIcon },
];
