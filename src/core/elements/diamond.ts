import { Polygon, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "../constants";

// 创建菱形
export const drawDiamond = (point: IPointData): IUI => {
    const diamond = new Polygon({
        name: "菱形",
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height,
        x: point.x,
        y: point.y,
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
        sides: 4,
        cornerRadius: DEFAULT_ELEMENT_OPTIONS.cornerRadius,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        id: uuidv4(),
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    });

    return diamond;
};