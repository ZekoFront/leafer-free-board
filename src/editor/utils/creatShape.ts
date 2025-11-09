import { type IPointData, type IUI } from "leafer-ui";
import { DrawArrow, DrawBoxText, DrawText } from "./DrawInstance";

export function createShape(type: string, point:IPointData) {
    if (type === 'rect') {
       return new DrawBoxText(point)
    } else if (type === 'text') {
        return new DrawText(point)
    } else if (type === 'arrow') {
        return new DrawArrow(point)
    } else {
        throw new Error('Unsupported shape type: ' + type)
    }
}