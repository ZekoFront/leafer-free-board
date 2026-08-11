import {
    ConnectionPlugin,
    CopyPlugin,
    DeleteHotKeyPlugin,
    DotMatrixPlugin,
    HandlerPlugin,
    HistoryPlugin,
    RulerPlugin,
    ScrollBarPlugin,
    ShapePlugin,
    SnapPlugin,
    HotKeyPlugin,
} from "@/plugins";

/** 编辑画板默认插件；ConnectionPlugin 需在 ShapePlugin / HistoryPlugin 之前注册 */
export const DEFAULT_EDIT_PLUGINS = [
    HandlerPlugin,
    ConnectionPlugin,
    SnapPlugin,
    RulerPlugin,
    ScrollBarPlugin,
    DotMatrixPlugin,
    ShapePlugin,
    HistoryPlugin,
    DeleteHotKeyPlugin,
    CopyPlugin,
    HotKeyPlugin,
];
