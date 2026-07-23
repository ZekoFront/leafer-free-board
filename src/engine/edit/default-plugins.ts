import {
    DotMatrixPlugin,
    RulerPlugin,
    ScrollBarPlugin,
    ShapePlugin,
    SnapPlugin,
} from "@/plugins";

/** 编辑画板默认插件，后续逐步补充 */
export const DEFAULT_EDIT_PLUGINS = [
    SnapPlugin,
    RulerPlugin,
    ScrollBarPlugin,
    DotMatrixPlugin,
    ShapePlugin,
];
