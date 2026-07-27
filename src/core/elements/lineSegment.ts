import { type IPointData, type IUI } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

export type SegmentKind = "arrow";
export type ConnectionToolKind = "line" | "curve";

export const MIN_SEGMENT_LENGTH = 4;

export function distanceBetweenPoints(a: IPointData, b: IPointData): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

/** 获取线段 points 数组（预览 / 更新用） */
export function getSegmentPoints(start: IPointData, end: IPointData): number[] {
    return [start.x, start.y, end.x, end.y];
}

const BASE_STROKE = {
    stroke: DEFAULT_ELEMENT_OPTIONS.lineStroke,
    strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    strokeCap: "round" as const,
    strokeJoin: "round" as const,
    editable: true,
    draggable: true,
};

/** 根据起点、终点创建线段/箭头/曲线 */
export function createSegmentByPoints(start: IPointData, end: IPointData): IUI {
    const points = getSegmentPoints(start, end);

    return new Arrow({
        id: uuidv4(),
        name: "Arrow",
        points,
        curve: false,
        endArrow: "angle",
        ...BASE_STROKE,
    });
}

/** 更新已有线段元素的 points */
export function updateSegmentPoints(
    element: IUI,
    start: IPointData,
    end: IPointData,
) {
    (element as IUI & { points: number[] }).points = getSegmentPoints(
        start,
        end,
    );
}
