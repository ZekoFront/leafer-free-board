import { type IPointData, type IUIInputData } from "leafer-ui";
import { drawArrow, drawBoxText, drawText, drawCircleText } from "./DrawInstance";

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
        case 'circle':
            element = drawCircleText(point)
            break;
        default:
            element = {} as IUIInputData
            console.error('Unsupported shape type: ' + type)
            break;
    }

    return element;
}