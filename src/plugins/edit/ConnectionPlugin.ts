import { MIN_CONNECTION_LABEL_GAP } from "@/core/constants";
import type EditorCore from "@/core/EditorCore";
import { drawConnectionLabel } from "@/core/elements";
import {
    distancePointToRectBounds,
    enforceMinGap,
    getBestConnectionByWorldBoxBounds,
    getBezierMidpoint,
    getBezierPathString,
    getLineElementEndpoints,
    getLineMidpoint,
    getPathElementEndpoints,
    getRectBounds,
    INFER_MAX_DISTANCE,
} from "@/core/geometry";
import type {
    IConnectionLineData,
    IConnectionRecord,
    IPluginTempl,
    ISerializedConnection,
} from "@/core/types";
import type { App, IPointData, IUI, Line, Path, Text } from "leafer-ui";

/**
 * ConnectionPlugin — 元素连线拓扑管理
 *
 * 职责：
 * - 维护 from/to/line/label 运行时关系表
 * - 节点移动/变换时重算四边连接点（Line.points / Path.path）
 * - 快照 export/import；JSON 导入后 rebuildConnectionsFromCanvas
 */
export class ConnectionPlugin implements IPluginTempl {
    static pluginName = "ConnectionPlugin";
    static apis = [
        "addConnection",
        "removeConnectionsForNode",
        "removeConnectionsByLineId",
        "updateConnectionsForNode",
        "getRelatedLines",
        "getRelatedLabels",
        "exportConnections",
        "importConnections",
        "rebuildConnectionsFromCanvas",
        "isConnectionLabel",
        "isConnectionLine",
        "syncConnectionLabelBackground",
        "clearConnections",
    ];

    pluginName = ConnectionPlugin.pluginName;

    /** 运行时拓扑：每条记录对应一条 line/curve 连线 */
    private connections: IConnectionRecord[] = [];

    constructor(public editor: EditorCore) {}

    isConnectionLabel(el: IUI): boolean {
        return !!(el as IUI & { data?: { isConnectionLabel?: boolean } }).data
            ?.isConnectionLabel;
    }

    isConnectionLine(el: IUI): boolean {
        return el.name === "ConnectionLine" || el.name === "ConnectionCurve";
    }

    /** 登记连线，并在 line.data 写入 from/to 供 JSON 序列化后重建拓扑 */
    addConnection(from: IUI, to: IUI, line: IUI, label: IUI | null) {
        this.attachConnectionMeta(line, from.id!, to.id!, label?.id);
        this.connections.push({ from, to, line, label });
        if (label) this.syncConnectionLabelBackground(label);
    }

    private attachConnectionMeta(
        line: IUI,
        fromId: string,
        toId: string,
        labelId?: string,
    ) {
        const target = line as IUI & { data?: IConnectionLineData };
        target.data = {
            ...(target.data ?? {}),
            connectionFromId: fromId,
            connectionToId: toId,
            connectionLabelId: labelId,
        };
    }

    updateConnectionsForNode(nodeId: string) {
        const app = this.editor.app;
        this.connections.forEach((conn) => {
            if (conn.from.id !== nodeId && conn.to.id !== nodeId) return;

            let { p0, p3 } = getBestConnectionByWorldBoxBounds(
                conn.from,
                conn.to,
                app,
            );
            if (conn.label) {
                ({ p0, p3 } = enforceMinGap(
                    p0,
                    p3,
                    MIN_CONNECTION_LABEL_GAP,
                ));
            }

            const isCurve = conn.line.tag === "Path";
            if (isCurve) {
                (conn.line as Path).path = getBezierPathString(p0, p3);
            } else {
                (conn.line as Line).points = [p0.x, p0.y, p3.x, p3.y];
            }

            if (conn.label) {
                const mid = isCurve
                    ? getBezierMidpoint(p0, p3)
                    : getLineMidpoint(p0, p3);
                conn.label.x = mid.x;
                conn.label.y = mid.y;
            }
        });
    }

    getRelatedLines(nodeId: string): IUI[] {
        return this.connections
            .filter(
                (conn) => conn.from.id === nodeId || conn.to.id === nodeId,
            )
            .map((conn) => conn.line);
    }

    getRelatedLabels(nodeId: string): IUI[] {
        return this.connections
            .filter(
                (conn) =>
                    (conn.from.id === nodeId || conn.to.id === nodeId) &&
                    conn.label,
            )
            .map((conn) => conn.label as IUI);
    }

    removeConnectionsByLineId(lineId: string) {
        this.connections = this.connections.filter(
            (conn) => conn.line.id !== lineId,
        );
    }

    removeConnectionsForNode(nodeId: string) {
        const related = this.connections.filter(
            (conn) => conn.from.id === nodeId || conn.to.id === nodeId,
        );
        related.forEach((conn) => {
            conn.line.remove?.();
            conn.label?.remove?.();
        });
        this.connections = this.connections.filter(
            (conn) => conn.from.id !== nodeId && conn.to.id !== nodeId,
        );
    }

    exportConnections(): ISerializedConnection[] {
        return this.connections
            .filter((conn) => conn.from?.id && conn.to?.id && conn.line?.id)
            .map((conn) => ({
                fromId: conn.from.id as string,
                toId: conn.to.id as string,
                lineId: conn.line.id as string,
                labelId: (conn.label?.id as string) || undefined,
                labelText: (conn.label as Text)?.text
                    ? String((conn.label as Text).text)
                    : undefined,
            }));
    }

    importConnections(data: ISerializedConnection[]) {
        this.connections = [];
        const tree = this.editor.app.tree;

        data.forEach((item) => {
            const from = tree.findId(item.fromId) as IUI | undefined;
            const to = tree.findId(item.toId) as IUI | undefined;
            const line = tree.findId(item.lineId) as IUI | undefined;
            if (!from || !to || !line) return;

            let label: IUI | null = null;
            if (item.labelId) {
                label = (tree.findId(item.labelId) as IUI) ?? null;
            }
            if (!label) {
                const { p0, p3 } = getBestConnectionByWorldBoxBounds(
                    from,
                    to,
                    this.editor.app,
                );
                const isCurve = line.tag === "Path";
                const mid = isCurve
                    ? getBezierMidpoint(p0, p3)
                    : getLineMidpoint(p0, p3);
                label = drawConnectionLabel(mid.x, mid.y);
                if (item.labelText) (label as Text).text = item.labelText;
                tree.add(label);
            }

            this.attachConnectionMeta(
                line,
                from.id!,
                to.id!,
                label?.id,
            );
            if (label) this.syncConnectionLabelBackground(label);
            this.connections.push({ from, to, line, label });
        });

        this.syncAllConnectionGeometry();
    }

    /**
     * JSON / Leafer tree 导入后重建拓扑。
     * 优先读 line.data.connectionFromId；缺失时按端点几何推断最近元素。
     */
    rebuildConnectionsFromCanvas() {
        this.connections = [];
        const app = this.editor.app;
        const tree = app.tree;
        const lines = this.collectConnectionLines(tree);

        for (const line of lines) {
            const linked = this.resolveConnectionNodes(line, app);
            if (!linked) continue;

            const { from, to, label } = linked;
            this.attachConnectionMeta(line, from.id!, to.id!, label?.id);
            this.connections.push({ from, to, line, label });
            if (label) this.syncConnectionLabelBackground(label);
        }

        this.syncAllConnectionGeometry();
    }

    /** 遍历 tree 下所有连线元素 */
    private collectConnectionLines(root: IUI): IUI[] {
        const result: IUI[] = [];
        const walk = (node: IUI) => {
            if (this.isConnectionLine(node)) result.push(node);
            const children = (node as IUI & { children?: IUI[] }).children;
            children?.forEach(walk);
        };
        walk(root);
        return result;
    }

    private resolveConnectionNodes(
        line: IUI,
        app: App,
    ): { from: IUI; to: IUI; label: IUI | null } | null {
        const tree = app.tree;
        const data = (line as IUI & { data?: IConnectionLineData }).data;

        let from: IUI | undefined;
        let to: IUI | undefined;
        let label: IUI | null = null;

        if (data?.connectionFromId && data?.connectionToId) {
            from = tree.findId(data.connectionFromId) as IUI | undefined;
            to = tree.findId(data.connectionToId) as IUI | undefined;
            if (data.connectionLabelId) {
                label =
                    (tree.findId(data.connectionLabelId) as IUI) ?? null;
            }
        }

        // 无 data 时：根据连线端点与元素包围盒距离推断
        if (!from || !to) {
            const endpoints = this.getConnectionLineEndpoints(line);
            if (!endpoints) return null;
            const candidates = this.collectConnectableNodes(tree);
            from =
                from ??
                this.findNearestNode(endpoints.p0, candidates, app);
            to =
                to ??
                this.findNearestNode(endpoints.p3, candidates, app);
        }

        if (!from?.id || !to?.id || from === to) return null;
        return { from, to, label };
    }

    private getConnectionLineEndpoints(
        line: IUI,
    ): { p0: IPointData; p3: IPointData } | null {
        if (line.tag === "Line") {
            const pts = (line as Line).points;
            return getLineElementEndpoints({
                points: Array.isArray(pts)
                    ? pts.flatMap((p) =>
                          typeof p === "number" ? p : [p.x, p.y],
                      )
                    : undefined,
            });
        }
        if (line.tag === "Path") {
            const path = (line as Path).path;
            return getPathElementEndpoints({
                path: typeof path === "string" ? path : undefined,
            });
        }
        return null;
    }

    private collectConnectableNodes(root: IUI): IUI[] {
        const result: IUI[] = [];
        const walk = (node: IUI) => {
            if (
                node.id &&
                !this.isConnectionLine(node) &&
                !this.isConnectionLabel(node)
            ) {
                result.push(node);
            }
            const children = (node as IUI & { children?: IUI[] }).children;
            children?.forEach(walk);
        };
        walk(root);
        return result;
    }

    private findNearestNode(
        point: IPointData,
        candidates: IUI[],
        app: App,
    ): IUI | undefined {
        let best: IUI | undefined;
        let bestDist = INFER_MAX_DISTANCE;
        for (const node of candidates) {
            const dist = distancePointToRectBounds(
                point,
                getRectBounds(node, app),
            );
            if (dist < bestDist) {
                bestDist = dist;
                best = node;
            }
        }
        return best;
    }

    /** 按当前元素位置重算全部连线几何 */
    private syncAllConnectionGeometry() {
        const nodeIds = new Set<string>();
        this.connections.forEach((conn) => {
            if (conn.from.id) nodeIds.add(conn.from.id);
            if (conn.to.id) nodeIds.add(conn.to.id);
        });
        nodeIds.forEach((id) => this.updateConnectionsForNode(id));
    }

    syncConnectionLabelBackground(label: IUI) {
        const textEl = label as Text;
        const hasText = !!textEl.text;
        const fill = hasText ? "#ffffff" : "transparent";
        const stroke = hasText ? "#ddd" : "transparent";
        const current = (textEl as any).boxStyle || {};
        if (current.fill !== fill || current.stroke !== stroke) {
            (textEl as any).boxStyle = { ...current, fill, stroke };
        }
    }

    /** 清空拓扑表（画布批量 remove 前调用，避免 stale 引用） */
    clearConnections() {
        this.connections = [];
    }

    destroy() {
        this.connections = [];
    }
}
