import { Arrow } from "@leafer-in/arrow";
import { Box, Ellipse, Group, PropertyEvent, Text, type IPointData, type IUI, type IUIInputData } from "leafer-ui";
import { v4 as uuidv4 } from 'uuid';

export function createElement(type: string, point:IPointData) {
    let element:IUIInputData;
    switch (type) {
        case 'rect':
            element = drawBoxText(point)
            break;
        case 'text':
            element = drawText(point)
            break;
        case 'arrow':
            element = drawArrow(point)
            break;
        case 'circle':
            element = drawCircleText(point)
            break;
        default:
            element = {} as IUIInputData
            console.error('Unsupported shape type: ' + type)
            break;
    }

    return element;
}

// 绘制元素的公共选项
const defaultOptions = {
    fill: '#32cd79',
    stroke: '#13ad8cff',
    fontColor: '#FFFFFF',
    cornerRadius: 10,
    opacity: 0.7,
    text: '双击编辑',
}

// 绘制箭头
export const drawArrow = (point:IPointData) => {
    return new Arrow({
        name: 'Arrow',
        curve: true,
        points: [point.x, point.y, 0, 0],
        strokeCap: 'round',
        strokeJoin: 'round',
        strokeWidth: 2,
        stroke: defaultOptions.stroke,
        startArrow: '',
        endArrow: 'angle',
        editable: true,
        draggable: true,
    })
}

// 绘制矩形文本
export const drawBoxText = (point:IPointData) => {
    return new Box({
        name: 'BoxText',
        x: point.x,
        y: point.y,
        fill: defaultOptions.fill,
        cornerRadius: 5,
        textBox: true,
        hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
        editable: true,
        resizeChildren: true, // 同时 resize 文本
        strokeWidth: 0,
        stroke: "#32cd79",
        children: [{
            id: uuidv4(),
            tag: 'Text',
            textWrap: 'break', 
            text: 'Welcome to LeaferJS',
            fill: defaultOptions.fontColor,
            fontSize: 16,
            padding: [16, 20],
            textAlign: 'left',
            verticalAlign: 'top',
            hittable: false // false表示无法被点击/拾取，true表示可以被点击/拾取
        }]
    })
}

// 绘制文本
export const drawText = (point:IPointData) => {
    return new Text({
        name: 'Text',
        fill: '#333333',
        placeholder: '请输入文本', // 占位符文本  
        placeholderColor: 'rgba(120,120,120,0.5)',  // 占位符颜色
        draggable: true,
        fontSize: 16,
        padding: 12,
        height: 50,
        boxStyle: {
            padding: 12
        },
        editable: true,
        x: point.x,
        y: point.y
    })
}

// 绘制圆形文本
export const drawCircleText = (point: IPointData):IUI => {
    // 定义最小尺寸和内边距
    const MIN_SIZE = 150;
    // 上下留白
    const PADDING = 20; 

    const circle = new Ellipse({
        editable: false,
        width: 150,
        height: 150,
        x: 0,
        y: 0,
        fill: defaultOptions.fill,
    })

    const text = new Text({
        draggable: false,
        editable: true,
        text: defaultOptions.text,
        fill: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        verticalAlign: 'middle',
        width: 130,
        height: 130,
        x: 10, 
        y: 10,
        textWrap: 'break', 
        dragBounds: 'parent', // 限制元素拖动范围
        padding: [15 , 5],
        boxStyle: {
            // fill: 'blue',
            // strokeWidth: 1,
            // stroke: '#333'
            padding: 6,
            
        }
    })

    const group = new Group({
        name: 'GroupCircleText',
        editable: true,
        x: point.x,
        y: point.y,
        width: 150,
        height: 150,
        fill: 'rgba(0,0,0,0)',
        hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
        children: [circle, text],
    })

    // 【关键逻辑】定义自动调整大小的函数
    const autoResize = () => {
        // 获取文本目前的真实高度
        const textHeight = text.height || 0;
        
        // 计算新高度：文本高度 + 上下边距，但不能小于最小尺寸
        const newHeight = Math.max(MIN_SIZE, textHeight + PADDING * 2);

        // 1. 更新背景高度
        circle.height = newHeight;
        // 2. 更新组高度
        group.height = newHeight;
        
        // 3. 重新垂直居中文字
        // 公式：(总高度 - 文本高度) / 2
        text.y = (newHeight - textHeight) / 2;
    }

    // 【关键监听】监听文本内容或样式变化
    text.on(PropertyEvent.CHANGE, (e: PropertyEvent) => {
        // 只有当改变的是文本内容、字体大小等影响布局的属性时才计算
        // console.log(e, 2222)
        // autoResize();
    })

    return group
}
