import { MIN_CONNECTION_LABEL_GAP } from "@/core/constants";
import type EditorCore from "@/core/EditorCore";
import { createConnectionByKind, createConnectionLabel } from "@/core/elements";
import {
    enforceMinGap,
    getBestConnectionByWorldBoxBounds,
} from "@/core/geometry";
import type { ConnectionKind, IPluginTempl } from "@/core/types";
import { debounce } from "lodash-es";
import type { IUI, Text } from "leafer-ui";

const PASTE_OFFSET = 50;

interface ClipboardConnection {
    fromId: string;
    toId: string;
    kind: ConnectionKind;
    labelText?: string;
}

interface ClipboardPayload {
    /** 选中元素的 JSON 快照（不含连线/标签） */
    nodes: ReturnType<IUI["toJSON"]>[];
    /** 两端都在选中集内的连线 */
    connections: ClipboardConnection[];
}

function isEditableTargetFocused(): boolean {
    const el = document.activeElement;
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function remapIdsInJson(
    data: Record<string, unknown>,
    generateId: () => string,
) {
    data.id = generateId();
    const children = data.children;
    if (Array.isArray(children)) {
        children.forEach((child) =>
            remapIdsInJson(child as Record<string, unknown>, generateId),
        );
    }
}

/**
 * CopyPlugin — 复制 / 粘贴
 *
 * - Ctrl+C：将选中图元（排除连线/标签）写入剪贴板，并记录选中集内部连线
 * - Ctrl+V：偏移粘贴，重建内部连线拓扑（ConnectionPlugin），HistoryPlugin 自动 ADD 入栈
 * - copyNode()：复制并立即粘贴（快捷 duplicate）
 */
export class CopyPlugin implements IPluginTempl {
    static pluginName = "CopyPlugin";
    static apis = ["copy", "paste", "copyNode"];

    pluginName = CopyPlugin.pluginName;
    hotkeys = ["ctrl+c", "ctrl+v"];

    private clipboard: ClipboardPayload | null = null;
    private pasteGeneration = 0;

    constructor(public editor: EditorCore) {}

    /** 复制当前选中图元到剪贴板 */
    copy() {
        const selected = this.getCopyableSelection();
        if (!selected.length) return;

        const selectedIds = new Set(
            selected.map((node) => node.id).filter(Boolean) as string[],
        );

        const connections: ClipboardConnection[] = [];
        for (const item of this.editor.exportConnections?.() ?? []) {
            if (!selectedIds.has(item.fromId) || !selectedIds.has(item.toId)) {
                continue;
            }
            const line = this.editor.getById(item.lineId);
            if (!line) continue;

            connections.push({
                fromId: item.fromId,
                toId: item.toId,
                kind: line.tag === "Path" ? "curve" : "line",
                labelText: item.labelText,
            });
        }

        this.clipboard = {
            nodes: selected.map((node) => node.toJSON?.() ?? node),
            connections,
        };
        this.pasteGeneration = 0;
    }

    /** 粘贴剪贴板内容到画布 */
    paste() {
        if (!this.clipboard?.nodes.length) return;

        this.pasteGeneration += 1;
        const offset = PASTE_OFFSET * this.pasteGeneration;
        const idMap = new Map<string, IUI>();
        const pasted: IUI[] = [];
        const tree = this.editor.app.tree;

        for (const nodeJson of this.clipboard.nodes) {
            const oldId = (nodeJson as { id?: string }).id;
            const data = structuredClone(nodeJson) as Record<string, unknown>;
            remapIdsInJson(data, () => this.editor.generateId());
            data.x = ((data.x as number) ?? 0) + offset;
            data.y = ((data.y as number) ?? 0) + offset;

            tree.add(data as never);
            const added = tree.findId(data.id as string);
            if (added && oldId) {
                idMap.set(oldId, added);
                pasted.push(added);
            }
        }

        this.pasteConnections(idMap);

        if (pasted.length) {
            this.editor.app.editor.select(pasted);
        }
    }

    /** 复制并立即粘贴（偏移一次） */
    copyNode() {
        this.copy();
        this.paste();
    }

    private pasteConnections(idMap: Map<string, IUI>) {
        if (!this.clipboard?.connections.length) return;

        const app = this.editor.app;
        const tree = app.tree;

        for (const conn of this.clipboard.connections) {
            const from = idMap.get(conn.fromId);
            const to = idMap.get(conn.toId);
            if (!from || !to) continue;

            let { p0, p3 } = getBestConnectionByWorldBoxBounds(from, to, app);
            ({ p0, p3 } = enforceMinGap(p0, p3, MIN_CONNECTION_LABEL_GAP));

            const line = createConnectionByKind(conn.kind, p0, p3);
            const label = createConnectionLabel(conn.kind, p0, p3);
            if (conn.labelText) {
                (label as Text).text = conn.labelText;
            }

            tree.add(line);
            tree.add(label);
            this.editor.addConnection?.(from, to, line, label);
        }
    }

    private getCopyableSelection(): IUI[] {
        const list = (this.editor.app.editor.list || []) as IUI[];
        return list.filter(
            (node) =>
                node.id &&
                !this.editor.isConnectionLine?.(node) &&
                !this.editor.isConnectionLabel?.(node),
        );
    }

    private copyDebounced = debounce(() => this.copy(), 200, {
        leading: true,
        trailing: false,
    });

    private pasteDebounced = debounce(() => this.paste(), 200, {
        leading: true,
        trailing: false,
    });

    hotkeyEvent = (eventName: string, e: KeyboardEvent) => {
        if (e.type !== "keyup") return;
        if (isEditableTargetFocused()) return;

        if (eventName === "ctrl+c") {
            e.preventDefault();
            this.copyDebounced();
        } else if (eventName === "ctrl+v") {
            e.preventDefault();
            this.pasteDebounced();
        }
    };

    destroy() {
        this.copyDebounced.cancel();
        this.pasteDebounced.cancel();
        this.clipboard = null;
        this.pasteGeneration = 0;
    }
}
