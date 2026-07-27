import { Star, type IPointData, type IUI } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_ELEMENT_OPTIONS } from "@/core/constants";

/** 官方案例预设 @see https://www.leaferjs.com/ui/reference/display/Star.html */
export type StarPresetKey = "star" | "star8" | "star7" | "star6" | "star4";

interface StarPresetConfig {
    name: string;
    corners: number;
    innerRadius?: number;
    cornerRadius?: number;
}

export const STAR_PRESETS: Record<StarPresetKey, StarPresetConfig> = {
    /** 五角星：corners 5（innerRadius 默认 0.382） */
    star: { name: "五角星", corners: 5, cornerRadius: 0 },
    /** 圆角星形：corners 8, innerRadius 0.5, cornerRadius 5 */
    star4: {
        name: "四角星",
        corners: 4,
        innerRadius: 0.5,
        cornerRadius: 5,
    },
    star6: {
        name: "六角星",
        corners: 6,
        innerRadius: 0.5,
        cornerRadius: 5,
    },
    star7: {
        name: "七角星",
        corners: 7,
        innerRadius: 0.5,
        cornerRadius: 5,
    },
    star8: {
        name: "八角星",
        corners: 8,
        innerRadius: 0.5,
        cornerRadius: 5,
    }
};

function createStarByPreset(point: IPointData, preset: StarPresetConfig): IUI {
    return new Star({
        id: uuidv4(),
        name: preset.name,
        x: point.x,
        y: point.y,
        width: DEFAULT_ELEMENT_OPTIONS.width,
        height: DEFAULT_ELEMENT_OPTIONS.height,
        corners: preset.corners,
        ...(preset.innerRadius !== undefined && {
            innerRadius: preset.innerRadius,
        }),
        cornerRadius: preset.cornerRadius ?? 0,
        fill: DEFAULT_ELEMENT_OPTIONS.fill,
        stroke: DEFAULT_ELEMENT_OPTIONS.stroke,
        strokeWidth: DEFAULT_ELEMENT_OPTIONS.strokeWidth,
        editable: DEFAULT_ELEMENT_OPTIONS.editable,
        draggable: DEFAULT_ELEMENT_OPTIONS.draggable,
    });
}

export function createStarByType(point: IPointData, type: StarPresetKey): IUI {
    return createStarByPreset(point, STAR_PRESETS[type]);
}
