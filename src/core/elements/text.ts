import { Text, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";

// 绘制文本
export const drawText = (point: IPointData): IUI => {
    return new Text({
        id: uuidv4(),
        name: "Text",
        fill: "#374151",
        placeholder: "请输入文本", // 占位符文本
        placeholderColor: "rgba(120,120,120,0.5)", // 占位符颜色
        draggable: true,
        fontSize: 16,
        padding: 12,
        height: 50,
        boxStyle: {
            padding: 12,
        },
        editable: true,
        x: point.x,
        y: point.y,
    });
};