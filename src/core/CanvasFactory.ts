import { App, type ILeaferType } from "leafer-ui";
import type { CanvasMode, IAppConfig } from "./types";
import {
    EDIT_APP_CONFIG,
    RENDER_APP_CONFIG,
    mergeAppConfig,
} from "./constants/default-app-config";

function toLeaferAppOptions(config: IAppConfig) {
    return {
        ground: config.ground,
        tree: config.tree
            ? { type: config.tree.type as ILeaferType }
            : undefined,
        editor: config.editor,
        sky: config.sky ?? {},
        fill: config.fill,
        touch: config.touch,
        pointer: config.pointer,
    };
}

export const CanvasFactory = {
    createApp(
        view: HTMLElement,
        mode: CanvasMode,
        overrides?: Partial<IAppConfig>,
    ): App {
        if (!view) throw new Error("[CanvasFactory] view 未就绪");
        const base = mode === "edit" ? EDIT_APP_CONFIG : RENDER_APP_CONFIG;
        const merged = mergeAppConfig(base, overrides);
        return new App({
            view,
            ...toLeaferAppOptions(merged),
        } as ConstructorParameters<typeof App>[0]);
    },
};
