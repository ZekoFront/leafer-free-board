import type { IUI, IUIInputData } from "leafer-ui";
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
    const rectA = getRectBounds(elA)
    const rectB = getRectBounds(elB)
    // 计算中心点
    const cxA = (rectA.left || 0) + (rectA.width || 0) / 2;
    const cyA = (rectA.top || 0) + (rectA.height || 0) / 2;
    const cxB = (rectB.left || 0) + (rectB.width || 0) / 2;
    const cyB = (rectB.top || 0) + (rectB.height || 0) / 2;

    const dx = cxB - cxA;
    const dy = cyB - cyA;

    // 结果容器
    let p0:IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 }, p3:IPointItem = { x: 0, y: 0, dirX: 0, dirY: 0 };

    // 1. 横向距离 > 纵向距离：左右连接模式
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            // [情况1] B 在 A 右边
            // p0: A的右点 (方向向右: 1, 0)
            // p3: B的左点 (方向向左: -1, 0)
            p0 = { x: rectA.right, y: cyA, dirX: 1,  dirY: 0 };
            p3 = { x: rectB.left || 0, y: cyB, dirX: -1, dirY: 0 };
        } else {
            // [情况2] B 在 A 左边
            // p0: A的左点 (方向向左: -1, 0)
            // p3: B的右点 (方向向右: 1, 0)
            p0 = { x: rectA.left || 0, y: cyA, dirX: -1, dirY: 0 };
            p3 = { x: rectB.right, y: cyB, dirX: 1,  dirY: 0 };
        }
    } 
    // 2. 纵向连接模式
    else {
        if (dy > 0) {
            // [情况3] B 在 A 下面
            // p0: A的下点 (方向向下: 0, 1)
            // p3: B的上点 (方向向上: 0, -1)
            p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
            p3 = { x: cxB, y: rectB.top || 0,    dirX: 0, dirY: -1 };
        } else {
            // [情况4] B 在 A 上面
            // p0: A的上点 (方向向上: 0, -1)
            // p3: B的下点 (方向向下: 0, 1)
            p0 = { x: cxA, y: rectA.top || 0,    dirX: 0, dirY: -1 };
            p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
        }
    }

    return { p0, p3 };
}


/**
 * 世界坐标：计算起点和终点的连接线
 * 
 * @param elA 
 * @param elB 
 * @returns { p0: IPointItem, p3: IPointItem }
 */
export const getBestConnectionByWorldBoxBounds = (elA: IUIInputData, elB: IUIInputData) => {
    // 获取世界坐标下的包围盒
    const rectA = getRectBounds(elA);
    const rectB = getRectBounds(elB);

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
            p3 = { x: rectB.left,  y: cyB, dirX: -1, dirY: 0 };
        } else {
            // B <- A
            p0 = { x: rectA.left,  y: cyA, dirX: -1, dirY: 0 };
            p3 = { x: rectB.right, y: cyB, dirX: 1, dirY: 0 };
        }
    } else {
        // 上下连接
        if (dy > 0) {
            // A
            // ↓
            // B
            p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
            p3 = { x: cxB, y: rectB.top,    dirX: 0, dirY: -1 };
        } else {
            // B
            // ↑
            // A
            p0 = { x: cxA, y: rectA.top,    dirX: 0, dirY: -1 };
            p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
        }
    }

    return { p0, p3 };
}

/**
 * 获取矩形的边界
 * 
 * @param rect 
 * @returns { top, bottom, left, right, width, height, centerX, centerY }
 */
export const getRectBounds = (rect: IUIInputData) => {
    // 本地坐标
    // return {
    //     top: rect.y,
    //     bottom: (rect.y || 0) + (rect.height || 0),
    //     left: rect.x,
    //     right: (rect.x || 0) + (rect.width || 0),
    //     width: rect.width,
    //     height: rect.height
    // }

    // 世界坐标
    // 强制转换为 IUI 类型以访问 worldBoxBounds
    const element = rect as IUI; 
    
    // 【核心修复】使用 worldBoxBounds
    // worldBoxBounds 会自动计算缩放(scale)、旋转(rotation)后的实际位置和大小
    const bounds = element.worldBoxBounds;

    return {
        top: bounds.y,
        bottom: bounds.y + bounds.height,
        left: bounds.x,
        right: bounds.x + bounds.width,
        width: bounds.width,
        height: bounds.height,
        // 顺便把中心点也算出来，后面要用
        centerX: bounds.x + bounds.width / 2,
        centerY: bounds.y + bounds.height / 2
    }
}

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
        y: p0.y + p0.dirY * controlDist
    };

    // cp2: 终点的控制点 (顺着 dir 方向延伸)
    const cp2 = {
        x: p3.x + p3.dirX * controlDist,
        y: p3.y + p3.dirY * controlDist
    };

    // 生成 SVG Path 命令: M 起点 C 控制点1 控制点2 终点
    return `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p3.x} ${p3.y}`;
}
