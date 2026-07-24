import { Rect, type IPointData, type IUI } from "leafer-ui";
import { DEFAULT_ELEMENT_OPTIONS } from "../constants";
import { v4 as uuidv4 } from "uuid";

// 创建rect
export const createRect = (point: IPointData): IUI => {
    return new Rect({
        id: uuidv4(),
        name: "矩形",
        x: point.x,
        y: point.y,
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
        cornerRadius: DEFAULT_ELEMENT_OPTIONS.cornerRadius,
    });
}