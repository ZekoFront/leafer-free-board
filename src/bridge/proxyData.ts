import { shallowReactive, watch } from "vue";
import { UI, defineKey } from "leafer-ui";

defineKey(UI.prototype, "proxyData", {
    get(this: any) {
        return this.__proxyData
            ? this.__proxyData
            : (this.__proxyData = this.createProxyData());
    },
});

UI.prototype.setProxyAttr = function (name: string, newValue: unknown): void {
    const data = (this as any).__proxyData;
    if (data && data[name] !== newValue) data[name] = newValue;
};

UI.prototype.getProxyAttr = function (name: string): any {
    const value = (this as any).__proxyData?.[name];
    return value === undefined ? (this as any).__.__get(name) : value;
};

UI.prototype.createProxyData = function (this: any) {
    const data = this.__.__getData();
    const proxyData = shallowReactive({ ...data });

    for (const name in data) {
        watch(
            () => proxyData[name],
            (newValue) => {
                if (this.__.__get(name) !== newValue) {
                    this[name] = newValue;
                }
            },
        );
    }

    return proxyData;
};

(UI.prototype as any).clearProxyData = function (this: any) {
    if (this.__proxyData) delete this.__proxyData;
};

export {};
