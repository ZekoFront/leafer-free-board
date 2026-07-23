import type { IAppConfig } from "../types/context";
import { DEFAULT_STEP_ZOOM, MAX_ZOOM, MIN_ZOOM } from "./zoom";

export const EDIT_APP_CONFIG: IAppConfig = {
    ground: { fill: "#e5e7eb" },
    tree: { type: "design" },
    editor: {
        // point: { cornerRadius: 0 },
        middlePoint: {},
        // rotatePoint: { width: 16, height: 16, cursor: "all-scroll" },
        // rect: { dashPattern: [3, 2] },
        selectedStyle: {
            strokeWidth: 0,
        },
        rect: {
            strokeWidth: 1,
            opacity: 0.5,
        },
    },
    sky: {},
    fill: "#fafafa",
    touch: { preventDefault: false },
    pointer: { preventDefaultMenu: true },
    zoom: { min: MIN_ZOOM, max: MAX_ZOOM },
    wheel: {
        zoomSpeed: DEFAULT_STEP_ZOOM,
    },
};

export const RENDER_APP_CONFIG: IAppConfig = {
    ground: { fill: "#e5e7eb" },
    tree: { type: "design" },
    editor: { visible: false },
    sky: {},
    fill: "#fafafa",
    touch: { preventDefault: false },
    pointer: { preventDefaultMenu: true },
};

export function mergeAppConfig(
    base: IAppConfig,
    overrides?: Partial<IAppConfig>,
): IAppConfig {
    if (!overrides) return { ...base };
    return {
        ...base,
        ...overrides,
        ground: { ...base.ground, ...overrides.ground },
        tree: { ...base.tree, ...overrides.tree },
        editor: { ...base.editor, ...overrides.editor },
        sky: { ...base.sky, ...overrides.sky },
        touch: { ...base.touch, ...overrides.touch },
        pointer: { ...base.pointer, ...overrides.pointer },
    };
}
