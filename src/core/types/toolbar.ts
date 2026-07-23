import type { Component } from "vue";

export interface IToolBarOption {
    label: string;
    key: string;
}

export interface IToolBar {
    icon: Component | string;
    title: string;
    type: string;
    draggable?: boolean;
    options?: IToolBarOption[];
}

/** 绘图工具激活状态（ShapePlugin 回调） */
export interface IDrawState {
    type: string;
    state: string;
}
