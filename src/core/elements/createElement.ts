import { type IPointData, type IUIInputData } from "leafer-ui";
import { createRect } from "./rect";
import { drawText } from "./text";
import { drawArrow } from "./arrow";
import { drawCircle } from "./circle";
import { drawDiamond } from "./diamond";
import { drawEllipse } from "./ellipse";
import { createPolygon } from "./polygonShape";
import { createRoundedRect } from "./roundedRect";
import { createMindTopic, createMindSubTopic } from "./mindNode";

export function createElement(type: string, point: IPointData) {
    let element: IUIInputData;
    switch (type) {
        case "rect":
            element = createRect(point);
            break;
        case "roundedRect":
            element = createRoundedRect(point);
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
        case "triangle":
            element = createPolygon(point, 3, "三角形");
            break;
        case "pentagon":
            element = createPolygon(point, 5, "五边形");
            break;
        case "hexagon":
            element = createPolygon(point, 6, "六边形");
            break;
        case "mindTopic":
            element = createMindTopic(point);
            break;
        case "mindSub":
            element = createMindSubTopic(point);
            break;
        default:
            element = {} as IUIInputData;
            console.error("Unsupported shape type: " + type);
            break;
    }

    return element;
}
