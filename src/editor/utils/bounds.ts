import type { App, IUI, IUIInputData } from "leafer-ui";
import type { IPointItem } from "../types";

/**
 * 本地坐标：计算起点和终点的连接线
 *
 *  获取两个矩形连接的最近点
 *  dirX: 1: 表示“向右走”，控制点会加到当前点的右边，把线拉出去
 *  dirY: -1: 表示“向上走”，控制点会减去 Y 值，把线向上提
 *
 * @param elA
 * @param elB
 * @returns { p0: IPointItem, p3: IPointItem }
 */
export const getBestConnection = (elA: IUIInputData, elB: IUIInputData) => {
    const rectA = getRectBounds(elA);
    const rectB = getRectBounds(elB);
    // 计算中心点
    const cxA = (rectA.left || 0) + (rectA.width || 0) / 2;
    const cyA = (rectA.top || 0) + (rectA.height || 0) / 2;
    const cxB = (rectB.left || 0) + (rectB.width || 0) / 2;
    const cyB = (rectB.top || 0) + (rectB.height || 0) / 2;

    const dx = cxB - cxA;
    const dy = cyB - cyA;

    // 结果容器
    let p0: IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 },
        p3: IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 };

    // 1. 横向距离 > 纵向距离：左右连接模式
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            // [情况1] B 在 A 右边
            // p0: A的右点 (方向向右: 1, 0)
            // p3: B的左点 (方向向左: -1, 0)
            p0 = { x: rectA.right, y: cyA, dirX: 1, dirY: 0 };
            p3 = { x: rectB.left || 0, y: cyB, dirX: -1, dirY: 0 };
        } else {
            // [情况2] B 在 A 左边
            // p0: A的左点 (方向向左: -1, 0)
            // p3: B的右点 (方向向右: 1, 0)
            p0 = { x: rectA.left || 0, y: cyA, dirX: -1, dirY: 0 };
            p3 = { x: rectB.right, y: cyB, dirX: 1, dirY: 0 };
        }
    }
    // 2. 纵向连接模式
    else {
        if (dy > 0) {
            // [情况3] B 在 A 下面
            // p0: A的下点 (方向向下: 0, 1)
            // p3: B的上点 (方向向上: 0, -1)
            p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
            p3 = { x: cxB, y: rectB.top || 0, dirX: 0, dirY: -1 };
        } else {
            // [情况4] B 在 A 上面
            // p0: A的上点 (方向向上: 0, -1)
            // p3: B的下点 (方向向下: 0, 1)
            p0 = { x: cxA, y: rectA.top || 0, dirX: 0, dirY: -1 };
            p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
        }
    }

    return { p0, p3 };
};

/**
 * 计算起点和终点的连接线（支持缩放/旋转/平移场景）
 *
 * @param elA
 * @param elB
 * @param app 传入 app 实例，用于将世界坐标转换为页面坐标
 * @returns { p0: IPointItem, p3: IPointItem }
 */
export const getBestConnectionByWorldBoxBounds = (
    elA: IUIInputData,
    elB: IUIInputData,
    app?: App,
) => {
    const rectA = getRectBounds(elA, app);
    const rectB = getRectBounds(elB, app);

    // 直接使用 worldBox 算出来的中心点
    const cxA = rectA.centerX;
    const cyA = rectA.centerY;
    const cxB = rectB.centerX;
    const cyB = rectB.centerY;

    const dx = cxB - cxA;
    const dy = cyB - cyA;

    let p0: IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 };
    let p3: IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 };

    if (Math.abs(dx) > Math.abs(dy)) {
        // 左右连接
        if (dx > 0) {
            // A -> B
            p0 = { x: rectA.right, y: cyA, dirX: 1, dirY: 0 };
            p3 = { x: rectB.left, y: cyB, dirX: -1, dirY: 0 };
        } else {
            // B <- A
            p0 = { x: rectA.left, y: cyA, dirX: -1, dirY: 0 };
            p3 = { x: rectB.right, y: cyB, dirX: 1, dirY: 0 };
        }
    } else {
        // 上下连接
        if (dy > 0) {
            // A
            // ↓
            // B
            p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
            p3 = { x: cxB, y: rectB.top, dirX: 0, dirY: -1 };
        } else {
            // B
            // ↑
            // A
            p0 = { x: cxA, y: rectA.top, dirX: 0, dirY: -1 };
            p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
        }
    }

    return { p0, p3 };
};

/**
 * 获取矩形的边界
 *
 * worldBoxBounds 能正确处理缩放(scale)、旋转(rotation)后的实际大小，
 * 但它返回的是世界坐标（包含视图平移/缩放变换）。
 * 当画布发生平移或缩放后，需要通过 app.getPagePoint() 转换回页面坐标，
 * 否则连线坐标会与实际元素位置产生偏移。
 *
 * @param rect
 * @param app 传入 app 实例时，自动将世界坐标转换为页面坐标
 * @returns { top, bottom, left, right, width, height, centerX, centerY }
 */
export const getRectBounds = (rect: IUIInputData, app?: App) => {
    const element = rect as IUI;

    // worldBoxBounds 会自动计算元素经过 scale、rotation 后的实际包围盒
    // 但返回值处于世界坐标系（包含视图平移/缩放变换）
    const bounds = element.worldBoxBounds;

    if (app) {
        // 世界坐标 → 页面坐标：
        // 取包围盒的左上角和右下角两个端点，通过 app.getPagePoint()
        // 反向剥离视图变换（zoomLayer 的 scale + translate），
        // 得到画布内容空间中的真实位置，与 Line.points / Path.path 同一坐标系
        const topLeft = app.getPagePoint({ x: bounds.x, y: bounds.y });
        const bottomRight = app.getPagePoint({
            x: bounds.x + bounds.width,
            y: bounds.y + bounds.height,
        });
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;

        return {
            top: topLeft.y,
            bottom: topLeft.y + height,
            left: topLeft.x,
            right: topLeft.x + width,
            width,
            height,
            centerX: topLeft.x + width / 2,
            centerY: topLeft.y + height / 2,
        };
    }

    // 未传入 app 时直接使用世界坐标（仅适用于视图未平移/缩放的场景）
    return {
        top: bounds.y,
        bottom: bounds.y + bounds.height,
        left: bounds.x,
        right: bounds.x + bounds.width,
        width: bounds.width,
        height: bounds.height,
        centerX: bounds.x + bounds.width / 2,
        centerY: bounds.y + bounds.height / 2,
    };
};

/**
 * 获取贝塞尔曲线的 SVG Path 命令
 *
 * @param p0 起点
 * @param p3 终点
 * @returns SVG Path 命令
 */
export const getBezierPathString = (p0: IPointItem, p3: IPointItem) => {
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
