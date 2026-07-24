import { Line, type IPointData, type IUI } from "leafer-ui";
import { Arrow } from "@leafer-in/arrow";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

export type SegmentKind = "arrow" | "line" | "curve";

export const MIN_SEGMENT_LENGTH = 4;

export function distanceBetweenPoints(a: IPointData, b: IPointData): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

/** 根据起点、终点计算曲线 points */
function buildCurvePoints(start: IPointData, end: IPointData): number[] {
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const offset = Math.min(80, len * 0.25);
    const cx = mx - (dy / len) * offset;
    const cy = my + (dx / len) * offset;
    return [start.x, start.y, cx, cy, end.x, end.y];
}

/** 获取线段 points 数组（预览 / 更新用） */
export function getSegmentPoints(
    kind: SegmentKind,
    start: IPointData,
    end: IPointData,
): number[] {
    if (kind === "curve") return buildCurvePoints(start, end);
    return [start.x, start.y, end.x, end.y];
}

const BASE_STROKE = {
    stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
    strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
    strokeCap: "round" as const,
    strokeJoin: "round" as const,
    editable: true,
    draggable: true,
};

/** 根据起点、终点创建线段/箭头/曲线 */
export function createSegmentByPoints(
    kind: SegmentKind,
    start: IPointData,
    end: IPointData,
): IUI {
    const points = getSegmentPoints(kind, start, end);

    if (kind === "line") {
        return new Line({
            id: uuidv4(),
            name: "Line",
            points,
            ...BASE_STROKE,
            endArrow: "arrow",
        });
    }

    if (kind === "arrow") {
        return new Arrow({
            id: uuidv4(),
            name: "Arrow",
            points,
            curve: false,
            endArrow: "angle",
            ...BASE_STROKE,
        });
    }

    return new Arrow({
        id: uuidv4(),
        name: "Curve",
        points,
        curve: true,
        endArrow: "angle",
        ...BASE_STROKE,
    });
}

/** 更新已有线段元素的 points */
export function updateSegmentPoints(
    element: IUI,
    kind: SegmentKind,
    start: IPointData,
    end: IPointData,
) {
    (element as IUI & { points: number[] }).points = getSegmentPoints(
        kind,
        start,
        end,
    );
}
