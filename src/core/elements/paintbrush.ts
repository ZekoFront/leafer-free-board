import { Pen } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

export const PAINTBRUSH_STROKE_WIDTH = 4;

export const PAINTBRUSH_STYLE = {
    stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
    strokeWidth: PAINTBRUSH_STROKE_WIDTH,
    strokeCap: "round" as const,
    strokeJoin: "round" as const,
};

/** 一笔至少需要 moveTo + 一次 lineTo */
export const MIN_PAINTBRUSH_POINTS = 2;

export function createPaintbrushPen() {
    return new Pen({
        id: uuidv4(),
        name: "Paintbrush",
        editable: true,
        draggable: true,
    });
}
