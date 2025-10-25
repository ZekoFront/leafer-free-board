import { App, DragEvent, Event, LeaferEvent, PropertyEvent, type ILeaf, type IUI, type IUIInputData } from "leafer-ui"
import { ExecuteTypeEnum, type IPluginClass, type IPluginOption, type IPluginTempl } from "./types"
import hotkeys from "hotkeys-js";
import { v4 as uuidv4 } from 'uuid';
import { HistoryManager } from "./plugins/history";
import { EditorEvent, EditorMoveEvent } from "@leafer-in/editor";
import { debounce, cloneDeep } from "lodash-es";

class EditorBoard {
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
    public isDragging: boolean = false;
    public selectElement: IUI | IUI[] = {} as IUI;
    public dragElement: ILeaf | ILeaf[] = {} as ILeaf;

    constructor(view: HTMLDivElement) {
        this.init(view)
    }

    private init(view: HTMLDivElement) {
        // 初始化leafer应用
        this.app = this.initApp(view)
        // 初始化历史管理器
        this.history = new HistoryManager(this, { maxHistorySize: 50 });
        // 监听事件
        this.listenners()
    }

    // 初始化应用
    private initApp(view: HTMLDivElement) {
        const app = new App({
            view: view,
            ground: {
                fill: '#91124c'
            },
            tree: {
                // design 可以按住空白键拖拽画布
                type: 'design',
            },
            editor: {
                // dimOthers: true, // 淡化其他元素，突出选中元素 //
                //dimOthers: 0.2 // 可指定淡化的透明度
                point: { cornerRadius: 0 },
                middlePoint: {},
                rotatePoint: { width: 16, height: 16 },
                rect: { dashPattern: [3, 2] },
                buttonsDirection: 'top',
            },
            sky: {},  // 添加 sky 层
            fill: '#ffffff', // 背景色 
            // wheel: { zoomMode: true, preventDefault: true }, // 全局鼠标滚动缩放元素
            touch: { preventDefault: true }, // 阻止移动端默认触摸屏滑动页面事件
            pointer: { preventDefaultMenu: true } // 阻止浏览器默认菜单事件
        })
        return app
    }

    private listenners() {
        // 画板加载完成事件监听
        this.app.sky.on(LeaferEvent.READY, function () {
            // editorBoard.createHistory({ id: uuidv4(), value: app.tree.toJSON() })
            console.log('画板加载完成')
        })

        const onDragEvent = debounce((evt: EditorMoveEvent) => {
            // 取消选中元素
            // this.app.editor.cancel()
            // editorBoard.createHistory({ id: uuidv4(), value: app.tree.toJSON() })
            if (this.selectElement) {
                if (Array.isArray(this.selectElement)) {

                } else {
                    // const { x, y } = this.selectElement
                    // const { x: x1, y: y1 } = evt.target
                    // this.history.execute({ type: ExecuteTypeEnum.MoveElement, elementId: this.selectElement.id, editor: this, tag: this.selectElement.tag, oldXYValue: { x, y }, newXYValue: { x: x1, y: y1 } })
                }
            }
            // console.log('EditorMoveEvent11', evt, evt.target.x, evt.target.y)
        }, 500);

        // 可选：监听其他需要的事件
        this.app.editor.on(EditorMoveEvent.MOVE, onDragEvent);
        // 监听画布元素选择事件
        this.app.editor.on(EditorEvent.SELECT, (evt:EditorEvent) => {
            this.selectElement = cloneDeep(evt.value)
            console.log('EditorEvent.SELECT', evt.value)
        });
        this.app.editor.on(DragEvent.START, (evt:DragEvent) => {
            this.dragElement = cloneDeep(evt.target)
            console.log('DragEvent.START', evt.target.x, evt.target.y)
        });
        this.app.editor.on(DragEvent.END, (evt:DragEvent) => {
            // 根据拖拽元素个数来处理
            const { x, y, id, tag } = this.dragElement as ILeaf
            const { x: x1, y: y1 } = evt.target
            this.history.execute({ 
                type: ExecuteTypeEnum.MoveElement, 
                elementId: id, 
                editor: this, 
                tag,
                oldXYValue: { x, y }, 
                newXYValue: { x: x1, y: y1 } 
            })
            console.log('DragEvent.END', evt.target.children)
        });

        // 监听leaferjs元素属性变化事件
        // this.app.editor.on(PropertyEvent.CHANGE, (evt: EditorMoveEvent) => {
        //     // this.isDragging = true;
        //     // 拖拽过程中禁止触发属性变化事件
        //     if (!this.isDragging) {
        //         console.log('PropertyEvent.CHANGE', this.app.draggable)
        //     }
           
        // })
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
    }
}

export default EditorBoard