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
        <div class="icon-block-blank">
            <n-icon :size="22" color="#b7b7b9">
                <VerticalLineIcon></VerticalLineIcon>
            </n-icon>
        </div>
        <div class="icon-block" title="添加图片" @click="uploadImage">
            <n-icon :size="22">
                <ImageAddIcon></ImageAddIcon>
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
import { Image, ImageEvent } from 'leafer-ui'    
import { RedoIcon, UndoIcon, VerticalLineIcon, ImageAddIcon } from '@/assets/icons'
import { ExecuteTypeEnum, type IDrawState, type IToolBar } from '../types'
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

const uploadImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
    input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        const file = target.files && target.files[0]
        if (!file) return

        const localUrl = URL.createObjectURL(file)

        const image = Image.one({  
            url: localUrl,
            draggable: true,
            editable: true,
            data: {
                executeType: ExecuteTypeEnum.AddElement
            }
        })
        image.once(ImageEvent.LOADED, function (e: ImageEvent) {
            console.log('image loaded', e)
        })
        image.once(ImageEvent.ERROR, function (e: ImageEvent) { 
            console.log('image error', e.error)
        })

        editorBoard.addLeaferElement(image)
        editorBoard.history.execute(image)
    }
}

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', editorBoard.history.state(), editorBoard.app.editor.children)
}
</script>