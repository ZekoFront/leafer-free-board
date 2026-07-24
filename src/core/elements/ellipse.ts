import { Ellipse, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "../constants";

// 绘制椭圆
export const drawEllipse = (point: IPointData): IUI => {
    const circle = new Ellipse({
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height / 2,
        x: point.x,
        y: point.y,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        id: uuidv4(),
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    });

    return circle;
};