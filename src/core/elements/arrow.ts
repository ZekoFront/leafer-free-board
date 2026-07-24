import { type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "../constants";
import { Arrow } from "@leafer-in/arrow";

// 绘制箭头
export const drawArrow = (point: IPointData): IUI => {
    return new Arrow({
        id: uuidv4(),
        name: "Arrow",
        curve: true,
        points: [point.x, point.y, 0, 0],
        strokeCap: "round",
        strokeJoin: "round",
        strokeWidth: 2,
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        startArrow: "",
        endArrow: "angle",
        editable: true,
        draggable: true,
    });
};