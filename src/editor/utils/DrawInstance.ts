// import { Arrow } from "leafer-editor";
import { Arrow  } from "@leafer-in/arrow";
import { Box, Text, type IPointData } from "leafer-ui";
import { v4 as uuidv4 } from 'uuid';

const options = {
    fill: '#32cd79',
    stroke: '#13ad8cff',
    fontColor: '#FFFFFF',
    cornerRadius: 10,
    opacity: 0.7,
}

export const drawArrow = (point:IPointData) => {
    return new Arrow({
        name: 'Arrow',
        curve: true,
        points: [point.x, point.y, 0, 0],
        strokeCap: 'round',
        strokeJoin: 'round',
        strokeWidth: 2,
        stroke: options.stroke,
        startArrow: '',
        endArrow: 'angle',
        editable: true,
        draggable: true,
    })
}

export const drawBoxText = (point:IPointData) => {
    return new Box({
        name: 'BoxText',
        x: point.x,
        y: point.y,
        fill: options.fill,
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
            text: 'Welcome to LeaferJS',
            fill: options.fontColor,
            fontSize: 16,
            padding: [5, 10],
            textAlign: 'left',
            verticalAlign: 'top',
            hittable: false // false表示无法被点击/拾取，true表示可以被点击/拾取
        }]
    })
}

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


export const drawCircleText = (point:IPointData) => {
    return new Box({
        name: 'CircleText',
        x: point.x,
        y: point.y,
        height: 100,
        width: 100,
        fill: '#32cd79',
        cornerRadius: 1000,
        lockRatio: true,
        textBox: true,
        hitChildren: true, // false:阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
        editable: true,
        resizeChildren: false,
        overflow: 'hide',
        children: [{
            tag: 'Text',
            x: 6,
            y: 30,
            text: '双击编辑',
            fill: '#ffffff',
            padding: [10, 20],
            textAlign: 'left',
            verticalAlign: 'top',
            editable: true,
            draggable: true
        }]
    })
}