import { Line, Path, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import {
    getBezierPathString,
    getLineMidpoint,
    getBezierMidpoint,
} from "@/core/geometry";
import { CONNECTION_LINE_STYLE, CONNECTION_PREVIEW_STYLE } from "@/core/constants";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";
import { drawConnectionLabel } from "./pathLabel";
import type { ConnectionKind, IConnectionPoint } from "@/core/types";

/** 拖拽中的虚线预览（中心 → 鼠标） */
export function createConnectionPreviewLine(
    start: { x: number; y: number },
    end: { x: number; y: number },
): Line {
    return new Line({
        id: uuidv4(),
        name: "ConnectionPreview",
        points: [start.x, start.y, end.x, end.y],
        ...CONNECTION_PREVIEW_STYLE,
    });
}

/** 四边识别后的正式 Line */
export function createConnectionLine(p0: IConnectionPoint, p3: IConnectionPoint): Line {
    return new Line({
        id: uuidv4(),
        name: "ConnectionLine",
        points: [p0.x, p0.y, p3.x, p3.y],
        stroke: DEFAULT_ELEMENT_OPTIONS.lineStroke,
        ...CONNECTION_LINE_STYLE,
    });
}

/** 四边识别后的正式 Path（曲线） */
export function createConnectionPath(p0: IConnectionPoint, p3: IConnectionPoint): Path {
    return new Path({
        id: uuidv4(),
        name: "ConnectionCurve",
        path: getBezierPathString(p0, p3),
        stroke: DEFAULT_ELEMENT_OPTIONS.lineStroke,
        ...CONNECTION_LINE_STYLE,
    });
}

/** 根据 kind 创建 line 或 path */
export function createConnectionByKind(
    kind: ConnectionKind,
    p0: IConnectionPoint,
    p3: IConnectionPoint,
): IUI {
    return kind === "curve"
        ? createConnectionPath(p0, p3)
        : createConnectionLine(p0, p3);
}

/** 连线中点标签 */
export function createConnectionLabel(
    kind: ConnectionKind,
    p0: IConnectionPoint,
    p3: IConnectionPoint,
) {
    const mid = kind === "curve"
        ? getBezierMidpoint(p0, p3)
        : getLineMidpoint(p0, p3);
    return drawConnectionLabel(mid.x, mid.y);
}