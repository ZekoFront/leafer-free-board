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


export const trackedAttrs = [
    'fontSize', 'fontWeight', 'italic', 'textDecoration',
    'fill', 'stroke', 'strokeWidth', 'dashPattern',
    'zIndex', 'text', 'padding',
    'startArrow', 'endArrow',
    "height", "width",
];

export const arrowTypes = [
    {
        label: "标准箭头",
        key: "arrow",
        icon: arrowIcon,
    },
    {
        label: "角度箭头",
        key: "angle",
        icon: angleIcon,
    },
    {
        label: "单边角度箭头",
        key: "angle-side",
        icon: angleSideIcon,
    },
    {
        label: "三角形箭头",
        key: "triangle",
        icon: triangleIcon,
    },
    {
        label: "反向三角形箭头",
        key: "triangle-flip",
        icon: triangleFlipIcon,
    },
    {
        label: "圆形箭头",
        key: "circle",
        icon: circleIcon,
    },
    {
        label: "圆形箭头(线性)",
        key: "circle-line",
        icon: circleLineIcon,
    },
    {
        label: "方形箭头",
        key: "square",
        icon: squareIcon,
    },
    {
        label: "方形箭头(线性)",
        key: "square-line",
        icon: squareLineIcon,
    },
    {
        label: "菱形箭头",
        key: "diamond",
        icon: diamondIcon,
    },
    {
        label: "菱形箭头(线性)",
        key: "diamond-line",
        icon: diamondLineIcon,
    },
    {
        label: "标注箭头",
        key: "mark",
        icon: markIcon,
    },
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

export const fontWeightList = [
    { label: "normal", value: "normal" },
    { label: "100", value: 100 },
    { label: "200", value: 200 },
    { label: "300", value: 300 },
    { label: "400", value: 400 },
    { label: "500", value: 500 },
    { label: "600", value: 600 },
    { label: "700", value: 700 },
    { label: "800", value: 800 },
    { label: "900", value: 900 },
];

export const fontStyleList = [
    {
        label: "粗体",
        value: "bold",
        icon: BoldIcon,
    },
    {
        label: "斜体",
        value: "italic",
        icon: ItalicIcon,
    },
    {
        label: "下划线",
        value: "under",
        icon: UnderlineIcon,
    },
];

export const exportOptions = [
    {
        label: "导出图片 png",
        key: "png",
    },
    {
        label: "导出图片 jpg",
        key: "jpg",
    },
    {
        label: "导出数据 json",
        key: "json",
    },
    {
        label: "导出图片 webp",
        key: "webp",
    },
    {
        label: "导出图片 bmp",
        key: "bmp",
    },
    {
        type: "divider",
        key: "d1",
    },
    {
        label: "导入 json 文件",
        key: "importJson",
    },
];
