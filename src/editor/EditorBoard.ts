import { EventEmitter } from "events";
import { App, type ILeaf, type IUIInputData } from "leafer-ui";
import {
    type IPluginClass,
    type IPluginOption,
    type IPluginTempl,
    type IBoardSnapshot,
    type ISerializedConnection,
} from "./types";
import hotkeys from "hotkeys-js";
import { v4 as uuidv4 } from "uuid";
import { HistoryManager } from "./history";
import HandlerPlugin from "./plugins/HandlerPlugin";

class EditorBoard extends EventEmitter {
    public app: App = {} as App;
    public history: HistoryManager = {} as HistoryManager;
    [key: string]: any;
    // 插件实例
    public pluginMap: {
        [propName: string]: IPluginTempl;
    } = {};
    // 自定义事件
    private customEvents: string[] = [];
    // 自定义API
    private customApis: string[] = [];

    constructor() {
        super();
        this.history = new HistoryManager(this, { maxHistorySize: 50 });
    }

    public init(app: App) {
        this.app = app;
        // this.history = new HistoryManager(this, { maxHistorySize: 50 })
        this._initHandlerPlugin();
    }

    // EditorBoard核心业务处理插件
    private _initHandlerPlugin() {
        this.use(HandlerPlugin);
    }

    public use(plugin: IPluginTempl, options?: IPluginOption) {
        try {
            if (this._checkPlugin(plugin) && this.app) {
                this._saveCustomAttr(plugin);
                const pluginRunTime = new (plugin as IPluginClass)(
                    this,
                    options || {},
                );
                pluginRunTime.pluginName = plugin.pluginName;
                this.pluginMap[plugin.pluginName] = pluginRunTime;
                this._bindingHotkeys(pluginRunTime);
                this._bindingApis(pluginRunTime);
            }
        } catch (err) {
            console.error(`[EditorBoard] 插件 "${plugin.pluginName}" 加载失败:`, err);
        }
        return this;
    }

    public addLeaferElement(element: IUIInputData) {
        if (!this.app.tree) {
            console.error("[EditorBoard] addLeaferElement 失败: 编辑器未初始化");
            return null;
        }

        if (!element.id) element.id = this.generateId();
        this.app.tree.add(element);

        return element;
    }

    public removeLeaferElement(elementId: string = "") {
        const element = this.getById(elementId);
        if (element && this.app.tree) {
            this.app.tree.remove(element);
            return true;
        }
        return false;
    }

    public getById(elementId: string = "") {
        return this.app.tree.findId(elementId);
    }

    // 绑定快捷键
    private _bindingHotkeys(plugin: IPluginTempl) {
        plugin?.hotkeys?.forEach((keyName: string) => {
            // 支持 keyup
            hotkeys(keyName, { keyup: true }, (e) => {
                plugin.hotkeyEvent && plugin.hotkeyEvent(keyName, e);
            });
        });
    }

    // 代理API事件
    private _bindingApis(pluginRunTime: IPluginTempl) {
        const { apis = [] } = (pluginRunTime.constructor as any) || {};
        apis.forEach((apiName: string) => {
            this[apiName] = function () {
                // eslint-disable-next-line prefer-rest-params
                return pluginRunTime[apiName].apply(pluginRunTime, [
                    ...arguments,
                ]);
            };
        });
    }

    // 保存组件自定义事件与API
    private _saveCustomAttr(plugin: IPluginTempl) {
        const { events = [], apis = [] } = plugin;
        this.customApis = this.customApis.concat(apis);
        this.customEvents = this.customEvents.concat(events);
    }

    private _checkPlugin(plugin: IPluginTempl): boolean {
        const { pluginName, events = [], apis = [] } = plugin;

        if (this.pluginMap[pluginName]) {
            console.warn(`[EditorBoard] 插件 "${pluginName}" 已注册，跳过重复初始化`);
            return false;
        }

        for (const eventName of events) {
            if (this.customEvents.includes(eventName)) {
                console.warn(`[EditorBoard] 插件 "${pluginName}" 事件 "${eventName}" 与已注册事件冲突，跳过`);
                return false;
            }
        }

        for (const apiName of apis) {
            if (this.customApis.includes(apiName)) {
                console.warn(`[EditorBoard] 插件 "${pluginName}" API "${apiName}" 与已注册 API 冲突，跳过`);
                return false;
            }
        }

        return true;
    }

    public generateId() {
        return uuidv4();
    }

    // 取消选择状态
    public cancelSelected() {
        this.app.editor.cancel();
    }

    public saveBoard(): IBoardSnapshot {
        const canvas = this.app.tree.children?.map((child: any) => child.toJSON()) || [];
        const connections: ISerializedConnection[] =
            typeof this.getSerializableConnections === "function"
                ? this.getSerializableConnections()
                : [];
        const history = this.history.saveState();
        return { canvas, connections, history, version: 1, timestamp: Date.now() };
    }

    public loadBoard(snapshot: IBoardSnapshot) {
        this.app.tree.clear();
        this.history.clear();

        snapshot.canvas.forEach((data: any) => {
            this.app.tree.add(data);
        });

        if (snapshot.connections?.length && typeof this.restoreConnections === "function") {
            this.restoreConnections(snapshot.connections);
        }

        if (snapshot.history) {
            this.history.restoreState(snapshot.history);
        }
    }

    public destroy() {
        this.history.destroy();
        Object.keys(this.pluginMap).forEach((key) => {
            try {
                this.pluginMap[key]?.destroy();
            } catch (err) {
                console.error(`[EditorBoard] 插件 "${key}" 销毁失败:`, err);
            }
        });
        this.app.destroy();
        this.pluginMap = {};
        this.customEvents = [];
        this.customApis = [];
        this.dragElement = {} as ILeaf;
        this.history = {} as HistoryManager;
    }

    // 解决 listener 为 undefined 的时候卸载错误
    public off(eventName: string, listener: any): this {
        // noinspection TypeScriptValidateTypes
        return listener ? super.off(eventName, listener) : this;
    }
}

export default EditorBoard;
