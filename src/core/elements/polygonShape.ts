import { Polygon, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";
import { buildPolygonPoints } from "@/core/geometry/polygonConnection";

const BASE = {
    width: DEFAULT_ELEMENT_OPTIONS.width,
    height: DEFAULT_ELEMENT_OPTIONS.height,
    fill: DEFAULT_ELEMENT_OPTIONS.fill,
    stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
    strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    editable: DEFAULT_ELEMENT_OPTIONS.editable,
    draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
    cornerRadius: DEFAULT_ELEMENT_OPTIONS.cornerRadius,
};

/** 创建正多边形（triangle / pentagon / hexagon 等） */
export function createPolygon(
    point: IPointData,
    sides: number,
    name: string,
): IUI {
    return new Polygon({
        id: uuidv4(),
        name,
        x: point.x,
        y: point.y,
        points: buildPolygonPoints(sides, BASE.width, BASE.height),
        ...BASE,
    });
}
