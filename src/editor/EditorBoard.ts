import { EventEmitter } from "events";
import { App, type ILeaf, type IUIInputData } from "leafer-ui"
import { type IPluginClass, type IPluginOption, type IPluginTempl } from "./types"
import hotkeys from "hotkeys-js";
import { v4 as uuidv4 } from 'uuid';
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
    public elementMap = new Map();

    public init(app: App) {
        this.app = app
        this.history = new HistoryManager(this, { maxHistorySize: 50 })
        this._initHandlerPlugin()
    }

    // EditorBoard核心业务处理插件
    private _initHandlerPlugin() {
        this.use(HandlerPlugin);
    }

    // 引入组件
    public use(plugin: IPluginTempl, options?: IPluginOption) {
        if (this._checkPlugin(plugin) && this.app) {
            this._saveCustomAttr(plugin);
            const pluginRunTime = new (plugin as IPluginClass)(this, options || {});
            // 添加插件名称
            pluginRunTime.pluginName = plugin.pluginName;
            this.pluginMap[plugin.pluginName] = pluginRunTime;
            this._bindingHotkeys(pluginRunTime);
            this._bindingApis(pluginRunTime);
        }
        return this;
    }

    public addLeaferElement(element: IUIInputData) {
        if (!this.app.tree) {
            throw new Error('Editor not initialized');
        }

        if (!element.id) element.id = this.generateId();
        this.app.tree.add(element);
        this.elementMap.set(element.id, element);

        return element.id;
    }

    
    public removeLeaferElement(elementId:string="") {
        const element = this.getById(elementId);
        if (element && this.app.tree) {
            this.app.tree.remove(element);
            this.elementMap.delete(elementId);
            return true;
        }
        return false;
    }

    public getById(elementId:string="") {
        return this.elementMap.get(elementId);
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
                return pluginRunTime[apiName].apply(pluginRunTime, [...arguments]);
            };
        });
    }

    // 保存组件自定义事件与API
    private _saveCustomAttr(plugin: IPluginTempl) {
        const { events = [], apis = [] } = plugin;
        this.customApis = this.customApis.concat(apis);
        this.customEvents = this.customEvents.concat(events);
    }

    // 检查组件
    private _checkPlugin(plugin: IPluginTempl) {
        const { pluginName, events = [], apis = [] } = plugin;
        //名称检查
        if (this.pluginMap[pluginName]) {
            throw new Error(pluginName + '插件重复初始化');
        }
        events.forEach((eventName: string) => {
            if (this.customEvents.find((info) => info === eventName)) {
                throw new Error(pluginName + '插件中' + eventName + '重复');
            }
        });

        apis.forEach((apiName: string) => {
            if (this.customApis.find((info) => info === apiName)) {
                throw new Error(pluginName + '插件中' + apiName + '重复');
            }
        });
        return true;
    }

    public generateId () {
        return uuidv4();
    }

    public destory() {
        this.app.destroy()
        this.pluginMap = {};
        this.customEvents = [];
        this.customApis = [];
        this.elementMap = new Map();
        this.dragElement = {} as ILeaf;
        this.history = {} as HistoryManager;
    }

    // 解决 listener 为 undefined 的时候卸载错误
    public off(eventName: string, listener: any): this {
        // noinspection TypeScriptValidateTypes
        return listener ? super.off(eventName, listener) : this;
    }
}

export default EditorBoard