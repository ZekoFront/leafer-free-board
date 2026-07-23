/** 画板运行时模式 */
export type CanvasMode = "edit" | "render";

export interface IAppConfig {
    ground?: { fill?: string };
    tree?: { type?: string };
    editor?: Record<string, unknown>;
    sky?: Record<string, unknown>;
    fill?: string;
    touch?: { preventDefault?: boolean };
    pointer?: { preventDefaultMenu?: boolean };
    zoom?: { min?: number; max?: number };
    wheel?: { zoomSpeed?: number };
}

export interface ICanvasContextOptions {
    view: HTMLElement;
    mode: CanvasMode;
    appConfig?: Partial<IAppConfig>;
    editor?: import("../EditorCore").default;
}
