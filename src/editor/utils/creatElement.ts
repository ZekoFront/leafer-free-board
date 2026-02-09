import { Arrow } from "@leafer-in/arrow";
import { Box, Ellipse, Group, Polygon, Text, type IPointData, type IUI, type IUIInputData } from "leafer-ui";
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
        case 'diamond':
            element = drawDiamondText(point)
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
    strokeWidth: 1,
    opacity: 0.7,
    text: '双击编辑',
}

// 绘制箭头
export const drawArrow = (point:IPointData):IUI => {
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
export const drawBoxText = (point:IPointData):IUI => {
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
export const drawText = (point:IPointData):IUI => {
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
        fill: defaultOptions.fontColor,
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

    return group
}

// 创建菱形文本
export const drawDiamondText = (point: IPointData):IUI => {
    const diamond = new Polygon({
        width: 150,
        height: 150,
        sides: 4,
        cornerRadius: 10,
        fill: '#32cd79'
    })

    const text = new Text({
        draggable: false,
        editable: true,
        text: defaultOptions.text,
        fill: defaultOptions.fontColor,
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
    })

    const group = new Group({
        editable: true,
        x: point.x,
        y: point.y,
        width: 150,
        height: 150,
        hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
        children: [diamond, text],
    })

    return group
}
