<template>
    <span>当前选择状态：[{{ x }},{{ y }}]</span>
    <span>{{ selector.selectedMode }}</span>
</template>

<script setup lang="ts">
import { useMouse } from '@/hooks/userMouse';
import type EditorBoard from './editor/EditorBoard';
import useSelectorListen from '@/hooks/useSelectorListen';

const editorBoard:any = inject('editorBoard')

const { x, y } = useMouse()
const selector = useSelectorListen(editorBoard)

</script>
