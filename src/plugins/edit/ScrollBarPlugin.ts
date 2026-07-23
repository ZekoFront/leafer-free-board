import { ScrollBar } from "@leafer-in/scroll";
import type EditorCore from "@/core/EditorCore";
import type { IPluginOption } from "@/core/types";

export class ScrollBarPlugin {
    static pluginName = "ScrollBarPlugin";
    static apis: string[] = [];
    static hotkeys: string[] = [];
    static events: string[] = [];

    pluginName = ScrollBarPlugin.pluginName;

    constructor(
        public editor: EditorCore,
        _options?: IPluginOption,
    ) {
        new ScrollBar(this.editor.app);
    }

    destroy() {
        // ScrollBar 由 Leafer 生命周期管理，无需额外清理
    }
}
