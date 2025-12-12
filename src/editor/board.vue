<template>
    <div class="leafer-free-board--root">
        <div class="leafer-free-board--header">
            <HeaderLeft :editor="editorBoard"></HeaderLeft>
            <ToolBar :editorBoard="editorBoard"></ToolBar>
            <HeaderRight :editor="editorBoard"></HeaderRight>
        </div>
        <div id="leafer" ref="boardRef" class="leafer-free-board--body"></div>
        <ElementAttributes></ElementAttributes>
    </div>
</template>
<script setup lang="ts">
import { App, Rect, Text, version, DragEvent, Bounds } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件
import ElementAttributes from './components/ElementAttributes.vue'
import HeaderLeft from './components/HeaderLeft.vue'
import HeaderRight from './components/HeaderRight.vue'
import "@leafer-in/find" // 导入查早元素插件
import '@leafer-in/export' // 引入导出元素插件
import { SnapPlugin, RulerPlugin, ScrollBarPlugin, ShapePlugin, DeleteHotKeyPlugin, CopyPlugin } from '@/editor/plugins'
import { EditorBoard } from '@/editor'
import ToolBar from './components/ToolBar.vue'
import { ExecuteTypeEnum } from './types';

const boardRef = useTemplateRef<HTMLDivElement>('boardRef')
let app: App = {} as App

// 初始化编辑器
const editorBoard:EditorBoard = new EditorBoard()

onMounted(() => {
    // 创建画板
    app = new App({
        view: boardRef.value!,
        ground: {
            fill: '#91124c'
        },
        tree: {
            // design 可以按住空白键拖拽画布
            type: 'design',
        },
        editor: {
            // dimOthers: true, // 淡化其他元素，突出选中元素 //
            //dimOthers: 0.2 // 可指定淡化的透明度
            point: { cornerRadius: 0 },
            middlePoint: {},
            rotatePoint: { width: 16, height: 16, cursor: "all-scroll" },
            rect: { dashPattern: [3, 2] },
            buttonsDirection: 'top',
        },
        sky: {},  // 添加 sky 层
        fill: '#ffffff', // 背景色 
        // wheel: { zoomMode: true, preventDefault: true }, // 全局鼠标滚动缩放元素
        touch: { preventDefault: true }, // 阻止移动端默认触摸屏滑动页面事件
        pointer: { preventDefaultMenu: true } // 阻止浏览器默认菜单事件
    })
    // 初始化leafer应用
    editorBoard.init(app)
    // 初始化插件
    editorBoard.use(SnapPlugin)
    editorBoard.use(RulerPlugin)
    editorBoard.use(ScrollBarPlugin)
    editorBoard.use(DeleteHotKeyPlugin)
    editorBoard.use(CopyPlugin)
    editorBoard.use(ShapePlugin)
    console.log('editorBoard:',editorBoard)
    const text = Text.one({
        id: editorBoard.generateId(),
        text: 'Action is the proper fruit of knowledge.',
        editable: true, 
        fill: '#FFE04B', 
        fontSize: 16,
        draggable: true,
        padding: 6,
        textAlign: 'center',
        cornerRadius: 5,
        boxStyle: {
            stroke: '#32cd79',
            strokeWidth: 2,
            cornerRadius: 5,
            fill: '#ffffff'
        },
        data: {
            executeType: ExecuteTypeEnum.AddElement
        }
    }, 100, 100, 100)
    editorBoard.addLeaferElement(text)
    editorBoard.history.execute(text)

    const rect = Rect.one({
        id: editorBoard.generateId(),
        name: 'rect',
        x: 100,
        y: 10,
        width: 100,
        height: 100,
        stroke: '#32cd79',
        strokeWidth: 2,
        fill: '#32cd79',
        draggable: true,
        cornerRadius: 5,
        editable: true,
        dashPattern: [6, 6], // 绘制虚线
        data: {
            executeType: ExecuteTypeEnum.AddElement
        }
    }, 300, 100, 100)
    editorBoard.addLeaferElement(rect)
    // 调用历史插件，添加历史记录
    editorBoard.history.execute(rect)

    // 检测 text 是否与 rect 碰撞 （通过世界坐标中的 box 包围盒跨层级检测）
    text.on(DragEvent.DRAG, () => {
        const rect2Bounds = new Bounds(rect.worldBoxBounds)  
        text.fill = rect2Bounds.hit(text.worldBoxBounds) ? 'blue' : '#FFE04B' // 碰撞则显示蓝色边框
    }) 

    // rect.on(PointerEvent.ENTER, onEnter)
    // rect.on(PointerEvent.LEAVE, onLeave)

    // function onEnter(e: PointerEvent) {
    //     if (e.current) {
    //         (e.current as Rect).fill = '#FFE04B'
    //     }
    // }

    // function onLeave(e: PointerEvent) {
    //     if (e.current) {
    //          (e.current as Rect).fill = '#32cd79'
    //     }
    // }
        
    // console.log("内容层元素:",app.tree.children)
})

onBeforeUnmount(() => {
    editorBoard.destroy()
})


provide('editorBoard', editorBoard)
console.log('leaferjs:', version)
</script>
<style lang="scss">
@use './css/index.scss';
</style>
