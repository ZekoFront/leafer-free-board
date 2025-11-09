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
            <component :is="item.icon"></component>
        </div>
        <div class="icon-block--undo" title="撤回" @click="editorBoard.history.undo()">
            <UndoIcon></UndoIcon>
        </div>
        <div class="icon-block--redo" title="重做" @click="editorBoard.history.redo()">
            <RedoIcon></RedoIcon>
        </div>
        <button @click="exportBoard">导出图片</button>
        <button @click="exportBoardJSON">导出JSON</button>
        <button @click="printHistory">打印历史记录</button>
    </div>
</template>

<script setup lang="ts">
import { RedoIcon, UndoIcon } from '@/icons'
import type { IToolBar } from '../types'
import useSelectorListen from '@/hooks/useSelectorListen';
import { toolbars as toolBarMenu } from "@/scripts/toolBar";
defineOptions({ name: 'ToolBar' })

const { editorBoard } = useSelectorListen()

const currentIndex = ref<number>(0)
const toolbars = shallowRef<IToolBar[]>(toolBarMenu)

const handleClick = (item: IToolBar, index: number) => {
    currentIndex.value = index
    editorBoard.setToolbarActive(item.type)
}

const exportBoard = () => {
    editorBoard.app.tree.syncExport('leafer.png',{ pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 })
}

const exportBoardJSON = () => {
    const json = editorBoard.app.tree.toJSON()
    console.log(json)
}

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', editorBoard.history.state())
}
</script>