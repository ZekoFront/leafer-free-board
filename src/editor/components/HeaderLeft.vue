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
import { useNaiveDiscrete } from "@/hooks/useNaiveDiscrete"
import type { IUIInputData } from 'leafer-ui'

const { message } = useNaiveDiscrete()

const props = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard
    }
})

const handleSelect = (type: string) => {
    if (type === 'importJson') {
        importJsonToCanvas()
    } else {
        props.editor.app.tree.syncExport(
            `free-board.${type}`, 
            { pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 }
        )
    }
        
}

const importJsonToCanvas = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json, application/json'
    input.multiple = false
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
    // 核心处理逻辑
    input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (!target.files?.length) {
            input.remove()
            return
        }

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const jsonStr = evt.target?.result as string
                if (!jsonStr) throw new Error('文件内容为空')

                const jsonData = JSON.parse(jsonStr)
                props.editor.history.clear()
                props.editor.app.tree.clear()
                if (jsonData.children && Array.isArray(jsonData.children)) {
                    props.editor.app.tree.add(jsonData.children as IUIInputData[])
                }
                message.success(`导入文件内容成功`)
            } catch (error) {
                console.error('导入出错:', error)
                message.error('导入失败: ' + (error instanceof Error ? error.message : '格式错误'))
            } finally {
                // 确保在读取完成后移除 input
                input.remove()
            }
        }

        reader.onerror = () => {
            message.error('文件读取发生错误')
            input.remove()
        }

        reader.readAsText(target.files[0] as File)
    }

    input.oncancel = () => {
        input.remove()
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
