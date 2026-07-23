<template>
    <span>当前选择状态：[{{ x }},{{ y }}]</span>
    <span>{{ isSingle }}{{ selectedMode }}</span>
</template>

<script setup lang="ts">
import { useMouse } from "@/hooks/userMouse";
import useSelectorListen from "@/hooks/useSelectorListen";

// const editorCore:any = inject(EDITOR_CORE_KEY)

const { x, y } = useMouse();
const { selectedMode, isSingle } = useSelectorListen();
</script>
