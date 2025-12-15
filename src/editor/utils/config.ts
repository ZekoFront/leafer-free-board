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
} from '@/assets/arrow'

import { BoldIcon, ItalicIcon, UnderlineIcon } from '@/assets/icons'

export const arrowTypes = [
    {
        label: '标准箭头',
        key: 'arrow',
        icon: arrowIcon
    },
    {
        label: '角度箭头',
        key: 'angle',
        icon: angleIcon
    },
    {
        label: '单边角度箭头',
        key: 'angle-side',
        icon: angleSideIcon
    },
    {
        label: '三角形箭头',
        key: 'triangle',
        icon: triangleIcon
    },
    {
        label: '反向三角形箭头',
        key: 'triangle-flip',
        icon: triangleFlipIcon
    },
    {
        label: '圆形箭头',
        key: 'circle',
        icon: circleIcon
    },
    {
        label: '圆形箭头(线性)',
        key: 'circle-line',
        icon: circleLineIcon
    },
    {
        label: '方形箭头',
        key: 'square',
        icon: squareIcon
    },
    {
        label: '方形箭头(线性)',
        key: 'square-line',
        icon: squareLineIcon
    },
    {
        label: '菱形箭头',
        key: 'diamond',
        icon: diamondIcon
    },
    {
        label: '菱形箭头(线性)',
        key: 'diamond-line',
        icon: diamondLineIcon
    },
    {
        label: '标注箭头',
        key: 'mark',
        icon: markIcon
    }
]

export const colorPanel = [
    '#18A058', '#2080F0', '#F0A020', '#FF4500', '#FF8C00', '#FFD700',
    '#90EE90', '#00CED1', '#1E90FF', '#C71585', '#32CD79', '#CCCCCC', '#000000',
    '#808080', '#404040', '#ABCDEF', '#FF4500', '#CC5800', '#FAD000', '#94E094',
    '#00BFBF', '#2680F0', '#C71585', '#FFFFFF', 
]

export const strokeColorList = [
    "#1e1e1e",
    "#e03131",
    "#2f9e44",
    "#1971c2",
    "#f08c00"
]

export const fontWeightList = [
    { label: 'normal', value: 'normal' },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '300', value: 300 },
    { label: '400', value: 400 },
    { label: '500', value: 500 },
    { label: '600', value: 600 },
    { label: '700', value: 700 },
    { label: '800', value: 800 },
    { label: '900', value: 900 }
]

export const fontStyleList = [
    {
        label: '粗体',
        value: 'bold',
        icon: BoldIcon
    }, 
    {
        label: '斜体',
        value: 'italic',
        icon: ItalicIcon
    }, 
    {
        label: '下划线',
        value: 'under',
        icon: UnderlineIcon
    }
]

export const exportOptions = [
    {
        label: '导出图片 png',
        key: 'png',
    },
    {
        label: '导出图片 png',
        key: 'jpg',
    },
    {
        label: '导出数据 json',
        key: 'json',
    },
    {
        label: '导出图片 webp',
        key: 'webp',
    },
    {
        label: '导出图片 bmp',
        key: 'bmp',
    },
    {
        type: 'divider',
        key: 'd1'
    },
    {
        label: '导入 json 文件',
        key: 'importJson',
    },
]