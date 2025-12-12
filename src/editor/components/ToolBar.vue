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
        <div class="icon-block icon-block--redo" title="清空画布" @click="handleClear">
            <n-icon :size="22">
                <ClearIcon></ClearIcon>
            </n-icon>
        </div>
        <button @click="printHistory">打印历史记录</button>
    </div>
</template>

<script setup lang="ts">
import { Image, ImageEvent } from 'leafer-ui'    
import { RedoIcon, UndoIcon, VerticalLineIcon, ImageAddIcon, ClearIcon } from '@/assets/icons'
import { ExecuteTypeEnum, type IDrawState, type IToolBar } from '../types'
import useSelectorListen from '@/hooks/useSelectorListen';
import { toolbars as toolBarMenu } from "@/editor/utils";
import { useNaiveDiscrete } from "@/hooks/useNaiveDiscrete"

const { editorBoard } = useSelectorListen()
const { dialog } = useNaiveDiscrete()

const handleClear = () => {
    dialog.warning({
        title: '警告',
        content: '清空画布后无法恢复，确定要清空吗？',
        positiveText: '确定',
        negativeText: '取消',
        draggable: true,
        onPositiveClick: () => {
            editorBoard.app.tree.clear()
        },
        onNegativeClick: () => {}
  })
}

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
    input.multiple = true
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
    input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        const file = target.files || []
        if (file?.length === 0) return
        for(let i = 0; i < file.length; i++) {
            setImage(file[i] as File, i)
        }
    }
}

const setImage = (file: File, index: number) => {
    let x = 100 + index * 50, y = 100;
    const localUrl = URL.createObjectURL(file)
    const image = Image.one({  
        url: localUrl,
        x, 
        y,
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

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', editorBoard.history.state())
}
</script>