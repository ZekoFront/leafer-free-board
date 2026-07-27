import type { App, Plugin } from "vue";
import EditorCanvas from "./engine/edit/EditorCanvas.vue";
import RenderCanvas from "./engine/render/RenderCanvas.vue";
import CanvasProvider from "./engine/edit/CanvasProvider.vue";

/** 可通过 app.use() 全局注册的对外组件 */
export const LeaferBoardComponents = {
    EditorCanvas,
    RenderCanvas,
    CanvasProvider,
} as const;

export type LeaferBoardComponentName = keyof typeof LeaferBoardComponents;

export interface LeaferBoardInstallOptions {
    /** 仅注册部分组件，默认注册全部 */
    components?: LeaferBoardComponentName[];
}

export function install(
    app: App,
    options?: LeaferBoardInstallOptions,
): void {
    const names =
        options?.components ??
        (Object.keys(LeaferBoardComponents) as LeaferBoardComponentName[]);

    for (const name of names) {
        app.component(name, LeaferBoardComponents[name]);
    }
}

/** Vue 插件：app.use(LeaferBoard) 全局注册画板组件 */
export const LeaferBoard: Plugin = { install };

export default LeaferBoard;
