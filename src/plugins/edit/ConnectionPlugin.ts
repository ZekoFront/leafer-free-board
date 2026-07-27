import { MIN_CONNECTION_LABEL_GAP } from "@/core/constants";
import type EditorCore from "@/core/EditorCore";
import { drawConnectionLabel } from "@/core/elements";
import {
    enforceMinGap,
    getBestConnectionByWorldBoxBounds,
    getBezierMidpoint,
    getBezierPathString,
    getLineMidpoint,
} from "@/core/geometry";
import type {
    IConnectionRecord,
    IPluginTempl,
    ISerializedConnection,
} from "@/core/types";
import type { IUI, Line, Path, Text } from "leafer-ui";

/**
 * ConnectionPlugin — 元素连线拓扑管理
 *
 * 职责：
 * - 维护 from/to/line/label 运行时关系表
 * - 节点移动/变换时重算四边连接点（Line.points / Path.path）
 * - 快照 export/import
 * - 删除节点时清理关联连线
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
        "isConnectionLabel",
        "isConnectionLine",
        "syncConnectionLabelBackground",
    ];

    pluginName = ConnectionPlugin.pluginName;

    /** 运行时拓扑：每条记录对应一条 line/curve 连线 */
    private connections: IConnectionRecord[] = [];

    constructor(public editor: EditorCore) {}

    /** 判断是否为连线中点标签（不可作为连线起/终点） */
    isConnectionLabel(el: IUI): boolean {
        return !!(el as IUI & { data?: { isConnectionLabel?: boolean } }).data
            ?.isConnectionLabel;
    }

    /** 判断是否为拓扑连线（Line / Path），不可作为连线起点 */
    isConnectionLine(el: IUI): boolean {
        return el.name === "ConnectionLine" || el.name === "ConnectionCurve";
    }

    /** 登记一条新连线（ShapePlugin 创建 line + label 后调用） */
    addConnection(from: IUI, to: IUI, line: IUI, label: IUI | null) {
        this.connections.push({ from, to, line, label });
        if (label) this.syncConnectionLabelBackground(label);
    }

    /**
     * 节点移动/缩放/旋转时，重算所有关联连线的四边端点。
     * Line 更新 points，Path 更新 path；标签移到中点。
     */
    updateConnectionsForNode(nodeId: string) {
        const app = this.editor.app;
        this.connections.forEach((conn) => {
            if (conn.from.id !== nodeId && conn.to.id !== nodeId) return;

            let { p0, p3 } = getBestConnectionByWorldBoxBounds(
                conn.from,
                conn.to,
                app,
            );
            // 为中间标签预留最小间距
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

    /** 获取与某节点关联的所有连线元素（供 HistoryPlugin 拖拽备份） */
    getRelatedLines(nodeId: string): IUI[] {
        return this.connections
            .filter(
                (conn) => conn.from.id === nodeId || conn.to.id === nodeId,
            )
            .map((conn) => conn.line);
    }

    /** 获取与某节点关联的所有标签元素 */
    getRelatedLabels(nodeId: string): IUI[] {
        return this.connections
            .filter(
                (conn) =>
                    (conn.from.id === nodeId || conn.to.id === nodeId) &&
                    conn.label,
            )
            .map((conn) => conn.label as IUI);
    }

    /** 按 lineId 移除拓扑记录（线已被外部 delete 时调用） */
    removeConnectionsByLineId(lineId: string) {
        this.connections = this.connections.filter(
            (conn) => conn.line.id !== lineId,
        );
    }

    /**
     * 删除节点前调用：移除该节点关联的 line、label，并清理拓扑表。
     * 需在 node.remove() 之前执行，避免悬挂引用。
     */
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

    /**
     * 从快照恢复拓扑（需在 canvas 元素全部 add 到 tree 之后调用）。
     * 若 label 缺失则按当前四边位置补建。
     */
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
            // 旧快照无 label 节点时，按四边中点补建
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
            if (label) this.syncConnectionLabelBackground(label);

            this.connections.push({ from, to, line, label });
        });
    }

    /**
     * 标签背景：有文字 → 白底遮线；无文字 → 透明。
     * 文本编辑后可再次调用以刷新样式。
     */
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

    destroy() {
        this.connections = [];
    }
}
