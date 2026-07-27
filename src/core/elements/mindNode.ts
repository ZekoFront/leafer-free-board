import { Rect, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { getElementTheme } from "@/theme/getElementTheme";

/** 思维导图 — 中心主题节点 */
export function createMindTopic(point: IPointData): IUI {
    const theme = getElementTheme();
    const id = uuidv4();
    return new Rect({
        id,
        name: "主题节点",
        x: point.x,
        y: point.y,
        width: 140,
        height: 56,
        fill: theme.fill,
        stroke: theme.strokeDark,
        strokeWidth: 1,
        cornerRadius: 12,
        editable: true,
        draggable: true,
        children: [
            {
                tag: "Text",
                text: "主题",
                fill: theme.onPrimary,
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
                verticalAlign: "middle",
                width: 140,
                height: 56,
            },
        ],
    });
}

/** 思维导图 — 子主题节点 */
export function createMindSubTopic(point: IPointData): IUI {
    const theme = getElementTheme();
    return new Rect({
        id: uuidv4(),
        name: "子主题",
        x: point.x,
        y: point.y,
        width: 108,
        height: 44,
        fill: theme.mindSub.fill,
        stroke: theme.mindSub.stroke,
        strokeWidth: 1.5,
        cornerRadius: 8,
        editable: true,
        draggable: true,
        children: [
            {
                tag: "Text",
                text: "子主题",
                fill: theme.mindSub.text,
                fontSize: 14,
                textAlign: "center",
                verticalAlign: "middle",
                width: 108,
                height: 44,
            },
        ],
    });
}
