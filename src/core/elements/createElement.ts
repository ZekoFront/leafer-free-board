import {
    type IPointData,
    type IUIInputData,
} from "leafer-ui";
import { createRect } from "./rect";
import { drawText } from "./text";
import { drawArrow } from "./arrow";
import { drawCircle } from "./circle";
import { drawDiamond } from "./diamond";
import { drawEllipse } from "./ellipse";

export function createElement(type: string, point: IPointData) {
    let element: IUIInputData;
    switch (type) {
        case "rect":
            element = createRect(point);
            break;
        case "text":
            element = drawText(point);
            break;
        case "arrow":
            element = drawArrow(point);
            break;
        case "circle":
            element = drawCircle(point);
            break;
        case "diamond":
            element = drawDiamond(point);
            break;
        case "ellipse":
            element = drawEllipse(point);
            break;
        default:
            element = {} as IUIInputData;
            console.error("Unsupported shape type: " + type);
            break;
    }

    return element;
}