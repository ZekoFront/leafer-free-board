import type { IPluginClass, IPluginOption } from "./types";
import { CanvasFactory } from "./CanvasFactory";
import EditorCore from "./EditorCore";
import type {
    CanvasMode,
    ICanvasContextOptions,
    ICanvasSnapshot,
} from "./types";

/**
 * 画板实例上下文
 *
 * 对外只暴露 editor，Leafer App 通过 editor.app 访问（单一入口，避免 ctx.app 与 editor.app 重复）
 */
export class CanvasContext {
    readonly mode: CanvasMode;
    readonly editor: EditorCore;

    constructor(options: ICanvasContextOptions) {
        this.mode = options.mode;
        const app = CanvasFactory.createApp(
            options.view,
            options.mode,
            options.appConfig,
        );
        this.editor = options.editor ?? new EditorCore();
        this.editor.bindApp(app);
    }

    loadSnapshot(snapshot: ICanvasSnapshot) {
        this.editor.loadSnapshot(snapshot);
    }

    saveSnapshot(): ICanvasSnapshot {
        return this.editor.saveSnapshot();
    }

    use(plugin: IPluginClass, options?: IPluginOption) {
        this.editor.use(plugin, options);
        return this;
    }

    destroy() {
        const app = this.editor.releaseApp();
        this.editor.destroy();
        app?.destroy?.();
    }
}
