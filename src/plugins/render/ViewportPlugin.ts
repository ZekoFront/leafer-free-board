import type EditorCore from "@/core/EditorCore";
import type { IPluginOption, IPluginTempl } from "@/core/types";

export interface ViewportPluginOptions extends IPluginOption {
    interactive?: boolean;
}

export class ViewportPlugin implements IPluginTempl {
    static pluginName = "ViewportPlugin";
    pluginName = ViewportPlugin.pluginName;

    private readonly previousPointerEvents: string;
    private readonly view: HTMLElement;

    constructor(
        public editor: EditorCore,
        public options: ViewportPluginOptions = {},
    ) {
        this.view = this.editor.app.view as HTMLElement;
        this.previousPointerEvents = this.view.style.pointerEvents;

        if (options.interactive === false) {
            this.view.style.pointerEvents = "none";
        }
    }

    destroy() {
        this.view.style.pointerEvents = this.previousPointerEvents;
    }
}
