import { Image, type App, type IPointData } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

/** 多张图片导入时的默认间距 */
const IMAGE_DROP_OFFSET = 48;

/**
 * 计算图片落点：当前视口中心（page 坐标）+ 索引偏移，避免多选重叠。
 */
export function getImageDropPoint(app: App, index = 0): IPointData {
    const w = app.width ?? 800;
    const h = app.height ?? 600;
    const center = app.getPagePoint({ x: w / 2, y: h / 2 });
    const offset = index * IMAGE_DROP_OFFSET;
    return {
        x: center.x - 100 + offset,
        y: center.y - 100 + offset,
    };
}

/** 由本地 URL 创建 Image 元素（Object URL / 远程地址均可） */
export function createImageFromUrl(
    url: string,
    point: IPointData,
    name?: string,
) {
    return Image.one({
        id: uuidv4(),
        name: name ?? "Image",
        url,
        x: point.x,
        y: point.y,
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
    });
}
