import { Image, type IPointData } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";
import { getViewportDropPoint } from "./viewport";

/** @deprecated 使用 getViewportDropPoint */
export const getImageDropPoint = getViewportDropPoint;

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
