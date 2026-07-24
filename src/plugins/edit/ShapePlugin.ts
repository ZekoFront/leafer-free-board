import type { IUIInputData } from "leafer-ui";
import { v4 as uuidv4 } from "uuid";
import type EditorCore from "@/core/EditorCore";
import { toolbarMenu } from "@/config";
import { type IDrawState, type IPluginTempl } from "@/core/types";
import { createElement } from "@/core/elements";

const DRAGGABLE_TYPES = new Set(
    toolbarMenu.filter((item) => item.draggable).map((item) => item.type),
);

/**
 * ShapePlugin — 工具栏拖拽创建图形
 *
 * 遵循 Leafer 官方 browser drop 示例：
 * - 工具栏 dragstart 写入 dataTransfer.type
 * - 画布 view 监听 dragover / drop
 * - drop 时用 app.getPagePointByClient 转 page 坐标并 createElement
 */
export class ShapePlugin implements IPluginTempl {
    static pluginName = "ShapePlugin";
    static apis = ["setToolbarActive"];

    pluginName = ShapePlugin.pluginName;

    private view: HTMLElement;

    constructor(public editor: EditorCore) {
        this.view = this.editor.app.view as HTMLElement;
        this.view.addEventListener("dragover", this.onDragOver);
        this.view.addEventListener("drop", this.onDrop);
    }

    setToolbarActive(type: string, _callBack: (state?: IDrawState) => void) {
        const app = this.editor.app;

        if (["arrow", "line", "curve"].includes(type)) {
            app.cursor = "crosshair";
            app.editor.config.selector = false;
        } else {
            app.cursor = "default";
            app.editor.config.selector = true;
        }
    }

    private onDragOver = (evt: DragEvent) => {
        evt.preventDefault();
    };

    private onDrop = (e: DragEvent) => {
        const type = e.dataTransfer?.getData("type");
        if (!type || !DRAGGABLE_TYPES.has(type)) return;

        const point = this.editor.app.getPagePointByClient(e);
        const shape = createElement(type, point);
        if (!shape || !(shape as { tag?: string }).tag) return;

        this.addToCanvas(shape);

        e.preventDefault();
    };

    /** 将元素直接添加到画布 tree 层，不经过 history */
    private addToCanvas(element: IUIInputData) {
        const tree = this.editor.app.tree;
        if (!tree) return;
        if (!element.id) element.id = uuidv4();
        tree.add(element);
    }

    destroy() {
        this.view.removeEventListener("dragover", this.onDragOver);
        this.view.removeEventListener("drop", this.onDrop);
    }
}
