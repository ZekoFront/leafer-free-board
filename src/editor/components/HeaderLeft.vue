<template>
    <n-dropdown trigger="click" :options="exportOptions" :show-arrow="true" @select="handleSelect">
        <n-icon title="导出" :size="26">
            <MenuLeftIcon></MenuLeftIcon>
        </n-icon>
    </n-dropdown>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { EditorBoard } from '@/editor'
import { NIcon, NDropdown } from 'naive-ui'
import { MenuLeftIcon } from '@/assets/icons'
import { exportOptions } from '@/editor/utils'

const props = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard
    }
})

const handleSelect = (type: string) => {
    if (type === 'importJson') {

    } else {
        props.editor.app.tree.syncExport(
            `free-board.${type}`, 
            { pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 }
        )
    }
        
}
</script>