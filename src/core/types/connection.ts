import type { IUI } from "leafer-ui";

/** 连接点：坐标 + 出边方向（曲线控制点用） */
export interface IConnectionPoint {
    x: number;
    y: number;
    dirX: -1 | 0 | 1;
    dirY: -1 | 0 | 1;
}

/** 运行时拓扑记录 */
export interface IConnectionRecord {
    from: IUI;
    to: IUI;
    line: IUI;
    label: IUI | null;
}

/** 快照序列化 */
export interface ISerializedConnection {
    fromId: string;
    toId: string;
    lineId: string;
    labelId?: string;
    labelText?: string;
}

export type ConnectionKind = "line" | "curve";