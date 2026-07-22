<template>
    <CanvasShell ref="shellRef">
        <slot />
    </CanvasShell>
</template>

<script setup lang="ts">
import CanvasShell from "./CanvasShell.vue";

/**
 * CanvasProvider — 画板 Context 提供者
 *
 * engine/shared 核心组件：在挂载 DOM 后创建 CanvasContext，
 * 通过 provide(CANVAS_CONTEXT_KEY) 向子树注入 app + editor。
 *
 * 核心职责：
 * - 接收 CanvasMode（edit | render）与可选 plugins 列表
 * - 调用 CanvasFactory + EditorCore 完成初始化
 * - provide CanvasContext，供 useCanvasContext / useEditorCore 使用
 * - onBeforeUnmount 时 ctx.destroy() 释放资源
 *
 * Props（规划）：
 * - mode: CanvasMode
 * - plugins?: IPluginTempl[]
 * - appConfig?: Partial<IAppConfig>
 *
 * 依赖：CanvasContext、CANVAS_CONTEXT_KEY、CanvasShell
 *
 * 迁移来源：由 `src/editor/board.vue` 中 onMounted 初始化逻辑拆出
 */
</script>
