type OptionsType = {
    label: string
    key: string
}
export interface IToolBar {
    icon: any
    title: string
    type: string
    draggable?: boolean
    options?: OptionsType[]
}


export interface IDrawState {
    type: string;
    state: string;
}

export interface IPointItem {
    x: number;
    y: number;
    dirX: number;
    dirY: number;
}