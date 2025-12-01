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

export class DrawArrow extends Arrow {
    constructor(point:IPointData) {
        super({
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
}

// Box 不设置宽高时，将自适应内容
export class DrawBoxText extends Box {
    constructor(point:IPointData) {
        super({
            name: 'BoxText',
            x: point.x,
            y: point.y,
            fill: options.fill,
            cornerRadius: 20,
            textBox: true,
            hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
            editable: true,
            resizeChildren: true, // 同时 resize 文本
            strokeWidth: 1,
            stroke: "#32cd79",
            height: 100,
            children: [{
                id: uuidv4(),
                tag: 'Text',
                text: 'Welcome to LeaferJS',
                fill: options.fontColor,
                fontSize: 16,
                padding: [10, 20],
                textAlign: 'left',
                verticalAlign: 'top'
            }]
        });
    }
}

export class DrawText extends Text {
    constructor(point:IPointData) {
        super({
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
        });
    }
}