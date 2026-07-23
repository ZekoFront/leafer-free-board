import { DotMatrix } from "leafer-x-dot-matrix";
import type EditorCore from "@/core/EditorCore";
import type { IPluginOption } from "@/core/types";

export class DotMatrixPlugin {
    static pluginName = "DotMatrixPlugin";
    static apis: string[] = [];
    static hotkeys: string[] = [];
    static events: string[] = [];

    pluginName = DotMatrixPlugin.pluginName;
    private dotMatrix: DotMatrix;

    constructor(
        public editor: EditorCore,
        _options?: IPluginOption,
    ) {
        this.dotMatrix = new DotMatrix(this.editor.app, {
            dotColor: "#EBEDF0",
        });
        this.dotMatrix.enableDotMatrix(true);
    }

    destroy() {
        this.dotMatrix?.enableDotMatrix(false);
    }
}
