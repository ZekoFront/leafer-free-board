import type { App, IPointData, IUI } from "leafer-ui";
import type { IConnectionPoint } from "../types";

/** 是否为 Polygon / Star 等轮廓类图元 */
export function isOutlineShape(el: IUI): boolean {
    return el.tag === "Polygon" || el.tag === "Star";
}

/** @deprecated 使用 isOutlineShape */
export function isPolygonElement(el: IUI): boolean {
    return isOutlineShape(el);
}

/** Star 本地顶点（内外圆交替取点，与 Leafer corners / innerRadius 一致） */
export function getStarLocalVertices(el: IUI): IPointData[] {
    const star = el as IUI & {
        width?: number;
        height?: number;
        corners?: number;
        innerRadius?: number;
        startAngle?: number;
    };

    const w = star.width ?? 100;
    const h = star.height ?? 100;
    const corners = star.corners ?? 5;
    const innerRatio = star.innerRadius ?? 0.382;
    const startRad = ((star.startAngle ?? 0) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const outerRx = w / 2;
    const outerRy = h / 2;
    const innerRx = outerRx * innerRatio;
    const innerRy = outerRy * innerRatio;
    const angleStep = Math.PI / corners;
    const vertices: IPointData[] = [];

    for (let i = 0; i < corners * 2; i++) {
        const angle = startRad + i * angleStep;
        const isOuter = i % 2 === 0;
        const rx = isOuter ? outerRx : innerRx;
        const ry = isOuter ? outerRy : innerRy;
        vertices.push({
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle),
        });
    }

    return vertices;
}

/** 读取轮廓图元本地顶点 */
export function getShapeLocalVertices(el: IUI): IPointData[] {
    if (el.tag === "Star") return getStarLocalVertices(el);
    return getPolygonLocalVertices(el);
}

/** 读取 Polygon 本地坐标顶点（points 模式或 sides 模式） */
export function getPolygonLocalVertices(el: IUI): IPointData[] {
    const polygon = el as IUI & {
        points?: number[] | IPointData[];
        sides?: number;
        startAngle?: number;
        width?: number;
        height?: number;
    };

    const w = polygon.width ?? 100;
    const h = polygon.height ?? 100;

    if (polygon.points?.length) {
        const pts = polygon.points;
        if (typeof pts[0] === "number") {
            const nums = pts as number[];
            const result: IPointData[] = [];
            for (let i = 0; i + 1 < nums.length; i += 2) {
                result.push({ x: nums[i]!, y: nums[i + 1]! });
            }
            return result;
        }
        return (pts as IPointData[]).map((p) => ({ x: p.x, y: p.y }));
    }

    const sides = polygon.sides ?? 3;
    const startRad = ((polygon.startAngle ?? 0) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const vertices: IPointData[] = [];
    for (let i = 0; i < sides; i++) {
        const angle = startRad + (2 * Math.PI * i) / sides;
        vertices.push({
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle),
        });
    }
    return vertices;
}

/** 构建贴边正多边形 points（相对 width/height，避免 sides 内接圆留白） */
export function buildPolygonPoints(
    sides: number,
    width: number,
    height: number,
): number[] {
    if (sides === 3) {
        return [width / 2, 0, width, height, 0, height];
    }

    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const start = -Math.PI / 2;
    const pts: number[] = [];
    for (let i = 0; i < sides; i++) {
        const angle = start + (i * 2 * Math.PI) / sides;
        pts.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    }
    return pts;
}

function localToPage(el: IUI, local: IPointData, app: App): IPointData {
    const ui = el as IUI & { getWorldPoint?: (p: IPointData) => IPointData };
    const world = ui.getWorldPoint
        ? ui.getWorldPoint(local)
        : { x: (el.x ?? 0) + local.x, y: (el.y ?? 0) + local.y };
    return app.getPagePoint(world);
}

function polygonCentroid(vertices: IPointData[]): IPointData {
    let x = 0;
    let y = 0;
    for (const v of vertices) {
        x += v.x;
        y += v.y;
    }
    return { x: x / vertices.length, y: y / vertices.length };
}

/** 射线 origin + t*dir 与线段 ab 的交点参数 t（仅取射向前方） */
function raySegmentIntersection(
    origin: IPointData,
    dir: IPointData,
    a: IPointData,
    b: IPointData,
): number | null {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const denom = dir.x * dy - dir.y * dx;
    if (Math.abs(denom) < 1e-9) return null;

    const t = ((a.x - origin.x) * dy - (a.y - origin.y) * dx) / denom;
    const u = ((a.x - origin.x) * dir.y - (a.y - origin.y) * dir.x) / denom;
    if (t > 1e-6 && u >= 0 && u <= 1) return t;
    return null;
}

function connectionDirection(
    center: IPointData,
    hit: IPointData,
): Pick<IConnectionPoint, "dirX" | "dirY"> {
    const absDx = Math.abs(hit.x - center.x);
    const absDy = Math.abs(hit.y - center.y);
    if (absDx > absDy) {
        return { dirX: hit.x >= center.x ? 1 : -1, dirY: 0 };
    }
    return { dirX: 0, dirY: hit.y >= center.y ? 1 : -1 };
}

/**
 * 从多边形中心朝目标点发射射线，取与多边形轮廓的交点作为连线锚点
 * （解决 sides 内接圆 / 矩形包围盒导致的连线空白）
 */
export function getConnectionPointOnPolygon(
    el: IUI,
    toward: IPointData,
    app: App,
): IConnectionPoint | null {
    const localVerts = getShapeLocalVertices(el);
    if (localVerts.length < 3) return null;

    const pageVerts = localVerts.map((v) => localToPage(el, v, app));
    const center = polygonCentroid(pageVerts);

    let dx = toward.x - center.x;
    let dy = toward.y - center.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return null;
    dx /= len;
    dy /= len;

    let bestT = Infinity;
    let hit: IPointData | null = null;
    const n = pageVerts.length;
    for (let i = 0; i < n; i++) {
        const a = pageVerts[i]!;
        const b = pageVerts[(i + 1) % n]!;
        const t = raySegmentIntersection(center, { x: dx, y: dy }, a, b);
        if (t !== null && t < bestT) {
            bestT = t;
            hit = { x: center.x + dx * t, y: center.y + dy * t };
        }
    }

    if (!hit) return null;

    return {
        x: hit.x,
        y: hit.y,
        ...connectionDirection(center, hit),
    };
}
