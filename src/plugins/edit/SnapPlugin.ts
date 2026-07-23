import { Snap } from "leafer-x-easy-snap";
import type EditorCore from "@/core/EditorCore";
import type { IPluginOption } from "@/core/types";

export class SnapPlugin {
    static pluginName = "SnapPlugin";
    static apis: string[] = [];
    static hotkeys: string[] = [];
    static events: string[] = [];

    pluginName = SnapPlugin.pluginName;
    private snap: Snap;

    constructor(
        public editor: EditorCore,
        _options?: IPluginOption,
    ) {
        this.snap = new Snap(this.editor.app);
        this.snap.enable(true);
    }

    destroy() {
        this.snap?.enable(false);
    }
}
