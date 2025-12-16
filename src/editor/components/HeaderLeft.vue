<template>
    <div class="left header-left default-shadow__wrapper">
        <div class="icon-block">
            <n-dropdown trigger="click" :options="exportOptions" :show-arrow="true" @select="handleSelect">
                <n-icon class="cursor" title="导出" :size="22">
                    <MenuLeftIcon></MenuLeftIcon>
                </n-icon>
            </n-dropdown>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { EditorBoard } from '@/editor'
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

<style lang="scss">
.header-left {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    width: fit-content;
}
</style>
