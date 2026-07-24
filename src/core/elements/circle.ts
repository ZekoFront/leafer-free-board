import { Ellipse, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "../constants";

// 绘制圆形
export const drawCircle = (point: IPointData): IUI => {
    const circle = new Ellipse({
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height,
        x: point.x,
        y: point.y,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        id: uuidv4(),
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    });

    return circle;
};