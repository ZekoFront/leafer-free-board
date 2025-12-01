import { type IPointData, type IUIInputData } from "leafer-ui";
import { drawArrow, drawBoxText, drawText } from "./DrawInstance";

export function createShape(type: string, point:IPointData) {
    let element:IUIInputData;
    switch (type) {
        case 'rect':
            element = drawBoxText(point)
            break;
        case 'text':
            element = drawText(point)
            break;
        case 'arrow':
            element = drawArrow(point)
            break;
        default:
            element = {} as IUIInputData
            console.error('Unsupported shape type: ' + type)
            break;
    }

    return element;
}