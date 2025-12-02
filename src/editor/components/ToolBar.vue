<template>
    <div class="center">
        <div 
            v-for="(item, index) in toolbars" 
            :key="item.type" 
            :class="['icon-block', { 'active': currentIndex === index }]" 
            :id="item.type" :title="item.title"
            :draggable="item.draggable" 
            @mousedown="handleClick(item, index)" 
            @click="handleClick(item, index)">
            <n-icon :size="22">
                <component :is="item.icon"></component>
            </n-icon>
        </div>
        <div class="icon-block icon-block--undo" title="撤销" @click="editorBoard.history.undo()">
            <n-icon :size="22">
                <UndoIcon></UndoIcon>
            </n-icon>
        </div>
        <div class="icon-block icon-block--redo" title="重做" @click="editorBoard.history.redo()">
            <n-icon :size="22">
                <RedoIcon></RedoIcon>
            </n-icon>
        </div>
        <button @click="printHistory">打印历史记录</button>
    </div>
</template>

<script setup lang="ts">
import { RedoIcon, UndoIcon } from '@/icons'
import type { IDrawState, IToolBar } from '../types'
import useSelectorListen from '@/hooks/useSelectorListen';
import { toolbars as toolBarMenu } from "@/editor/utils";
import { NIcon  } from 'naive-ui';
defineOptions({ name: 'ToolBar' })

const { editorBoard } = useSelectorListen()

const currentIndex = ref<number>(0)
const toolbars = shallowRef<IToolBar[]>(toolBarMenu)

const handleClick = (item: IToolBar, index: number) => {
    currentIndex.value = index
    editorBoard.setToolbarActive(item.type, (state?:IDrawState) => {
        if (state?.type === item.type) {
            currentIndex.value = 0
        }
    })
}

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', editorBoard.history.state(), editorBoard.app.editor.children)
}
</script>