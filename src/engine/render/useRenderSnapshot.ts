import { nextTick, watch, type Ref } from "vue";
import type { CanvasContext } from "@/core/CanvasContext";
import type { ICanvasSnapshot } from "@/core/types";

type RenderSnapshotInput = ICanvasSnapshot | ICanvasSnapshot["canvas"];

export interface UseRenderSnapshotOptions {
    ctx: Ref<CanvasContext | null>;
    snapshot: Ref<RenderSnapshotInput | undefined>;
    fitView?: Ref<boolean> | boolean;
}

function isCanvasSnapshot(value: RenderSnapshotInput): value is ICanvasSnapshot {
    return !Array.isArray(value) && Array.isArray(value.canvas);
}

function normalizeSnapshot(value: RenderSnapshotInput): ICanvasSnapshot {
    if (isCanvasSnapshot(value)) return value;
    return {
        canvas: value,
        connections: [],
        version: 1,
        timestamp: Date.now(),
    };
}

function getFitViewValue(value: Ref<boolean> | boolean | undefined): boolean {
    if (typeof value === "boolean") return value;
    return value?.value ?? true;
}

function getChildrenBounds(children: unknown[]) {
    const boxes = children
        .map((child) => (child as { worldBoxBounds?: unknown }).worldBoxBounds)
        .filter(Boolean) as Array<{
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }>;

    if (!boxes.length) return null;

    const x1 = Math.min(...boxes.map((box) => box.x ?? 0));
    const y1 = Math.min(...boxes.map((box) => box.y ?? 0));
    const x2 = Math.max(...boxes.map((box) => (box.x ?? 0) + (box.width ?? 0)));
    const y2 = Math.max(...boxes.map((box) => (box.y ?? 0) + (box.height ?? 0)));

    return {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
    };
}

function fitCanvasToView(ctx: CanvasContext) {
    const app = ctx.editor.app;
    const tree = app.tree as unknown as {
        children?: unknown[];
        scale?: number;
        x?: number;
        y?: number;
        zoomLayer?: {
            scale?: number;
            x?: number;
            y?: number;
        };
    };
    const bounds = getChildrenBounds(tree.children ?? []);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;

    const viewWidth = app.width || 800;
    const viewHeight = app.height || 600;
    const padding = 48;
    const scale = Math.min(
        1,
        (viewWidth - padding * 2) / bounds.width,
        (viewHeight - padding * 2) / bounds.height,
    );
    const target = tree.zoomLayer ?? tree;

    target.scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    target.x = viewWidth / 2 - (bounds.x + bounds.width / 2) * target.scale;
    target.y = viewHeight / 2 - (bounds.y + bounds.height / 2) * target.scale;
}

export function useRenderSnapshot(options: UseRenderSnapshotOptions) {
    watch(
        [options.ctx, options.snapshot],
        async ([ctx, snapshot]) => {
            if (!ctx || !snapshot) return;

            ctx.loadSnapshot(normalizeSnapshot(snapshot));
            await nextTick();

            if (getFitViewValue(options.fitView)) {
                fitCanvasToView(ctx);
            }
        },
        { deep: true, immediate: true },
    );
}
