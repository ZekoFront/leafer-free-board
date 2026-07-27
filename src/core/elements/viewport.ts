import type { App, IPointData } from "leafer-ui";

const DROP_OFFSET = 48;

/** 视口中心落点（page 坐标），多元素时错开 */
export function getViewportDropPoint(app: App, index = 0): IPointData {
    const w = app.width ?? 800;
    const h = app.height ?? 600;
    const center = app.getPagePoint({ x: w / 2, y: h / 2 });
    const offset = index * DROP_OFFSET;
    return {
        x: center.x - 100 + offset,
        y: center.y - 100 + offset,
    };
}
