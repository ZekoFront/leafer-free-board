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
import { Path, Rect, Text } from 'leafer-ui'

const { message } = useNaiveDiscrete()

const props = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard
    }
})

const handleSelect = (type: string) => {
    if (type === 'importJson') {
       const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json, application/json'
        // 只能单选
        input.multiple = false
        input.style.display = 'none'
        document.body.appendChild(input)
        input.click()
        input.onchange = (e) => {
            try {
                const target = e.target as HTMLInputElement
                if (!target.files?.length) return
                const reader = new FileReader()
                reader.onload = (evt) => {
                    const jsonStr = evt.target?.result
                    const jsonData = JSON.parse(jsonStr as string)
                    // 导入之前清空画布
                    props.editor.app.tree.clear()
                    console.log(jsonData, 'JSON 数据')
                    props.editor.history.clear()
                    if (jsonData) {
                        jsonData.children.forEach((child: any) => {
                            let newChild:IUIInputData = {} as IUIInputData
                            if (child.tag === 'Text') {
                                newChild = Text.one({...child })
                            } else if (child.tag === 'Path') {
                                newChild = Path.one({...child })
                            } else if (child.tag === 'Rect') {
                                newChild = Rect.one({...child })
                            }
                            props.editor.addLeaferElement(newChild)
                            props.editor.history.execute(newChild)
                        })
                    }
                    message.success('JSON 导入成功')
                }
                reader.readAsText(target.files[0] as File)
            } catch (error) {
                console.error('JSON 解析失败或格式错误:', error)
                message.error('JSON 解析失败或格式错误:'+JSON.stringify(error))
            }
        }
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
