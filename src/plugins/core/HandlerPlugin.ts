
import {
    type IPluginTempl,
} from "@/core/types";


/**
 * HandlerPlugin — 核心事件处理插件
 *
 * 监听 Leafer 引擎事件（选择、拖拽、属性变更、缩放），
 * 转换为 EditorCore 上的 SelectEvent / CustomEvent 与历史命令。
 */
export class HandlerPlugin implements IPluginTempl {
    pluginName = "HandlerPlugin";
    events?: string[] | undefined;
    apis?: string[] | undefined;
    hotkeys?: string[] | undefined;
    hotkeyEvent?: ((name: string, e: KeyboardEvent) => void) | undefined;
    destroy?: (() => void) | undefined;
    
}

export default HandlerPlugin
