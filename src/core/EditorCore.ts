import { EventEmitter } from "events";
import { App } from "leafer-ui";
import hotkeys from "hotkeys-js";
import { v4 as uuidv4 } from "uuid";
import type {
    ICanvasSnapshot,
    IPluginClass,
    IPluginOption,
    IPluginTempl,
} from "./types";

export default class EditorCore extends EventEmitter {
    private _app: App | null = null;
    pluginMap: Record<string, IPluginTempl> = {};
    [key: string]: any;

    constructor() {
        super();
    }

    bindApp(app: App) {
        this._app = app;
    }

    releaseApp(): App | null {
        const app = this._app;
        this._app = null;
        return app;
    }

    get app(): App {
        if (!this._app) {
            throw new Error("[EditorCore] App 未绑定或已销毁");
        }
        return this._app;
    }

    use(plugin: IPluginClass, options?: IPluginOption) {
        if (!this._app) {
            console.warn("[EditorCore] App 未绑定，跳过插件加载");
            return this;
        }
        if (this.pluginMap[plugin.pluginName]) {
            console.warn(`[EditorCore] 插件 "${plugin.pluginName}" 已注册`);
            return this;
        }
        try {
            const instance = new plugin(this, options ?? {});
            instance.pluginName = plugin.pluginName;
            this.pluginMap[plugin.pluginName] = instance;
            this.bindHotkeys(instance);
            this.bindApis(instance, plugin);
        } catch (err) {
            console.error(
                `[EditorCore] 插件 "${plugin.pluginName}" 加载失败:`,
                err,
            );
        }
        return this;
    }

    generateId() {
        return uuidv4();
    }

    saveSnapshot(): ICanvasSnapshot {
        const canvas =
            this.app.tree?.children?.map(
                (child) => child.toJSON?.() ?? child,
            ) ?? [];
        return {
            canvas,
            history: this.exportHistory?.(),
            version: 1,
            timestamp: Date.now(),
        };
    }

    loadSnapshot(snapshot: ICanvasSnapshot) {
        this.runWithoutRecording?.(() => {
            this.app.tree.clear();
            snapshot.canvas.forEach((item) => {
                this.app.tree.add(item as never);
            });
        });

        if (snapshot.history) {
            this.importHistory?.(snapshot.history);
        } else {
            this.clearHistory?.();
        }
    }

    destroy() {
        Object.values(this.pluginMap).forEach((plugin) => {
            try {
                plugin.destroy?.();
            } catch (err) {
                console.error(
                    `[EditorCore] 插件 "${plugin.pluginName}" 销毁失败:`,
                    err,
                );
            }
        });
        this.pluginMap = {};
        this.removeAllListeners();
    }

    private bindHotkeys(plugin: IPluginTempl) {
        plugin.hotkeys?.forEach((keyName: string) => {
            hotkeys(keyName, { keyup: true }, (e) => {
                plugin.hotkeyEvent?.(keyName, e);
            });
        });
    }

    private bindApis(pluginRunTime: IPluginTempl, pluginClass: IPluginClass) {
        const apis = pluginClass.apis ?? [];
        apis.forEach((apiName: string) => {
            this[apiName] = (...args: unknown[]) =>
                (pluginRunTime as any)[apiName]?.(...args);
        });
    }

    on(eventName: string, listener: (...args: any[]) => void): this {
        return super.on(eventName, listener);
    }

    off(eventName: string, listener?: (...args: any[]) => void): this {
        return listener ? super.off(eventName, listener) : this;
    }
}
