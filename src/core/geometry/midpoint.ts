import type { IConnectionPoint } from "../types";

/**
 * 直线中点
 */
export const getLineMidpoint = (p0: IConnectionPoint, p3: IConnectionPoint) => ({
    x: (p0.x + p3.x) / 2,
    y: (p0.y + p3.y) / 2,
});

/**
 * 贝塞尔曲线中点 (t=0.5)
 * 使用与 getBezierPathString 相同的控制点算法
 */
export const getBezierMidpoint = (p0: IConnectionPoint, p3: IConnectionPoint) => {
    const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const controlDist = Math.min(dist * 0.5, 100);
    const cp1 = {
        x: p0.x + p0.dirX * controlDist,
        y: p0.y + p0.dirY * controlDist,
    };
    const cp2 = {
        x: p3.x + p3.dirX * controlDist,
        y: p3.y + p3.dirY * controlDist,
    };
    return {
        x: (p0.x + 3 * cp1.x + 3 * cp2.x + p3.x) / 8,
        y: (p0.y + 3 * cp1.y + 3 * cp2.y + p3.y) / 8,
    };
};

/**
 * 当两端点间距不足 minGap 时，沿连线方向向外对称扩展
 */
export const enforceMinGap = (
    p0: IConnectionPoint,
    p3: IConnectionPoint,
    minGap: number,
): { p0: IConnectionPoint; p3: IConnectionPoint } => {
    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= minGap || dist === 0) return { p0, p3 };
    const half = (minGap - dist) / 2;
    const ux = dx / dist;
    const uy = dy / dist;
    return {
        p0: { ...p0, x: p0.x - ux * half, y: p0.y - uy * half },
        p3: { ...p3, x: p3.x + ux * half, y: p3.y + uy * half },
    };
};

/**
 * 获取贝塞尔曲线的 SVG Path 命令
 *
 * @param p0 起点
 * @param p3 终点
 * @returns SVG Path 命令
 */
export const getBezierPathString = (p0: IConnectionPoint, p3: IConnectionPoint) => {
    // 动态计算控制力度：距离越远，控制臂越长，曲线越平滑
    const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const controlDist = Math.min(dist * 0.5, 100); // 限制最大弯曲程度

    // cp1: 起点的控制点 (顺着 dir 方向延伸)
    const cp1 = {
        x: p0.x + p0.dirX * controlDist,
        y: p0.y + p0.dirY * controlDist,
    };

    // cp2: 终点的控制点 (顺着 dir 方向延伸)
    const cp2 = {
        x: p3.x + p3.dirX * controlDist,
        y: p3.y + p3.dirY * controlDist,
    };

    // 生成 SVG Path 命令: M 起点 C 控制点1 控制点2 终点
    return `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p3.x} ${p3.y}`;
};