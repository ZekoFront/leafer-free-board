import type { IPointData } from "leafer-ui";
import { getRectBounds } from "./bounds";

const INFER_MAX_DISTANCE = 120;

/** 点到矩形包围盒的最短距离（点在内部时为 0） */
export function distancePointToRectBounds(
    p: IPointData,
    rect: ReturnType<typeof getRectBounds>,
): number {
    const dx = Math.max(rect.left - p.x, 0, p.x - rect.right);
    const dy = Math.max(rect.top - p.y, 0, p.y - rect.bottom);
    return Math.hypot(dx, dy);
}

/** 从 Line.points 读取起终点 */
export function getLineElementEndpoints(line: {
    points?: number[];
}): { p0: IPointData; p3: IPointData } | null {
    const pts = line.points;
    if (!pts || pts.length < 4) return null;
    return {
        p0: { x: pts[0] ?? 0, y: pts[1] ?? 0 },
        p3: { x: pts[2] ?? 0, y: pts[3] ?? 0 },
    };
}

/** 从 Path.path（M…C…）解析起终点 */
export function getPathElementEndpoints(pathEl: {
    path?: string;
}): { p0: IPointData; p3: IPointData } | null {
    const pathStr = pathEl.path;
    if (!pathStr) return null;
    const start = pathStr.match(/M\s*([-\d.]+)\s+([-\d.]+)/);
    const end = pathStr.match(
        /C\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)\s*$/,
    );
    if (!start) return null;
    if (end) {
        return {
            p0: { x: Number(start[1]), y: Number(start[2]) },
            p3: { x: Number(end[1]), y: Number(end[2]) },
        };
    }
    // 非贝塞尔 path 时取 M 后最后一个坐标对
    const pairs = [...pathStr.matchAll(/([-\d.]+)\s+([-\d.]+)/g)];
    if (pairs.length < 2) return null;
    const last = pairs[pairs.length - 1];
    return {
        p0: { x: Number(start[1]), y: Number(start[2]) },
        p3: { x: Number(last?.[1]), y: Number(last?.[2]) },
    };
}

export { INFER_MAX_DISTANCE };
