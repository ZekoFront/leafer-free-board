/**
 * useRenderSnapshot — 渲染容器快照热更新
 *
 * 供 RenderCanvas 使用，监听 props.snapshot 变化并同步到 CanvasContext。
 *
 * 核心职责：
 * - `watch(snapshot, load)`：deep / immediate，调用 ctx.loadSnapshot()
 * - 支持完整 ICanvasSnapshot 或仅 canvas[] 简写
 * - 首次挂载 fitView：计算 app.tree 包围盒并 zoom 适配（fitView=true 时）
 * - 渲染模式跳过 history.restoreState
 *
 * 参数（规划）：
 * - snapshot: Ref<ICanvasSnapshot | ICanvasSnapshot['canvas'] | undefined>
 * - ctx: CanvasContext
 * - fitView?: boolean
 *
 * 优化（后期）：
 * - 增量 diff 替代全量 clear + add，减少大图闪烁
 *
 * 依赖：CanvasContext、ICanvasSnapshot
 */

export function useRenderSnapshot() {}
