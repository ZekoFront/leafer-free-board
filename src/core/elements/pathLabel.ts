import type { IUI } from "leafer-ui"
import { v4 as uuidv4 } from "uuid";
import { Text } from "leafer-ui";

// 绘制路径标签文本
export const drawConnectionLabel = (midX: number, midY: number): IUI => {
    const connectionLabelText = new Text({
        id: uuidv4(),
        name: "ConnectionLabel",
        text: "",
        placeholder: "",
        fontSize: 12,
        editable: true,
        draggable: false,
        textAlign: "center",
        verticalAlign: "middle",
        around: "center",
        x: midX,
        y: midY,
        width: 40,
        height: 20,
        padding: [2, 6],
        boxStyle: {
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 1,
            cornerRadius: 4,
        },
        data: { isConnectionLabel: true },
    })

    return connectionLabelText
}