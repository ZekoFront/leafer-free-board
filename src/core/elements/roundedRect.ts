import { Rect, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

/** 圆角矩形 */
export function createRoundedRect(point: IPointData): IUI {
    return new Rect({
        id: uuidv4(),
        name: "圆角矩形",
        x: point.x,
        y: point.y,
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
        cornerRadius: 24,
    });
}
