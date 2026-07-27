import type { App, IUI, IUIInputData } from "leafer-ui";
import type { IConnectionPoint } from "../types";
import {
    getConnectionPointOnPolygon,
    isPolygonElement,
} from "./polygonConnection";

/**
 * 计算起点和终点的连接线（支持缩放/旋转/平移场景）
 *
 * Polygon 使用轮廓射线交点，其余图元使用 worldBox 四边中点。
 */
export const getBestConnectionByWorldBoxBounds = (
    elA: IUIInputData,
    elB: IUIInputData,
    app?: App,
) => {
    const rectA = getRectBounds(elA, app);
    const rectB = getRectBounds(elB, app);

    const cxA = rectA.centerX;
    const cyA = rectA.centerY;
    const cxB = rectB.centerX;
    const cyB = rectB.centerY;

    const dx = cxB - cxA;
    const dy = cyB - cyA;

    let p0: IConnectionPoint = { x: 0, y: 0, dirX: 0, dirY: 0 };
    let p3: IConnectionPoint = { x: 0, y: 0, dirX: 0, dirY: 0 };

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            p0 = { x: rectA.right, y: cyA, dirX: 1, dirY: 0 };
            p3 = { x: rectB.left, y: cyB, dirX: -1, dirY: 0 };
        } else {
            p0 = { x: rectA.left, y: cyA, dirX: -1, dirY: 0 };
            p3 = { x: rectB.right, y: cyB, dirX: 1, dirY: 0 };
        }
    } else {
        if (dy > 0) {
            p0 = { x: cxA, y: rectA.bottom, dirX: 0, dirY: 1 };
            p3 = { x: cxB, y: rectB.top, dirX: 0, dirY: -1 };
        } else {
            p0 = { x: cxA, y: rectA.top, dirX: 0, dirY: -1 };
            p3 = { x: cxB, y: rectB.bottom, dirX: 0, dirY: 1 };
        }
    }

    if (app && isPolygonElement(elA as IUI)) {
        const edge = getConnectionPointOnPolygon(
            elA as IUI,
            { x: cxB, y: cyB },
            app,
        );
        if (edge) p0 = edge;
    }

    if (app && isPolygonElement(elB as IUI)) {
        const edge = getConnectionPointOnPolygon(
            elB as IUI,
            { x: cxA, y: cyA },
            app,
        );
        if (edge) p3 = edge;
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