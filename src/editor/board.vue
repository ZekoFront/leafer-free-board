<template>
    <div class="leafer-free-board--root">
        <div class="leafer-free-board--header">
            <div class="left">左边</div>
            <div class="center">
                <button @click="exportBoard">导出图片</button>
                <button @click="exportBoardJSON">导出JSON</button>
                <button @click="editorBoard.history.undo">撤销</button>
                <button @click="editorBoard.history.redo">重做</button>
                <button @click="printHistory">打印历史记录</button>
                <Header />
            </div>
            <div class="right">右边</div>
        </div>
        <div ref="boardRef" class="leafer-free-board--body">

        </div>
    </div>
    
</template>
<script setup lang="ts">
import { App, Rect, Text, version } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件
import "@leafer-in/find" // 导入查早元素插件
import '@leafer-in/export' // 引入导出元素插件
import Header from './components/Header.vue'
import { SnapPlugin, RulerPlugin, ScrollBarPlugin } from '@/editor/plugins'
import { EditorBoard } from '@/editor'

const boardRef = useTemplateRef<HTMLDivElement>('boardRef')
let app: App = {} as App

const exportBoard = () => {
    app.tree.syncExport('leafer.png',{ pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 })
}

const exportBoardJSON = () => {
    const json = app.tree.toJSON()
    console.log(json)
}

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', editorBoard.history.state())
}

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
            rotatePoint: { width: 16, height: 16 },
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
    }, 300, 100, 100)
    editorBoard.addLeaferElement(rect)
    // 调用历史插件，添加历史记录
    editorBoard.history.execute(rect)

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

// console.log('editorBoard:', editorBoard)

provide('editorBoard', editorBoard)
console.log('leaferjs:', version)
</script>
<style lang="scss">
.leafer-free-board {
    &--root {
        height: 100%;
        width: 100%;
        position: relative;
        user-select: none;
        margin-left: 0px;
        margin-top: 0px;
        pointer-events: auto;
    }
    &--header {
        // position: absolute;
        // top: 30px;
        // left: 50%;
        background: #ffffff;
        box-sizing: border-box;
        border-radius: .5rem;
        padding: 4px;
        box-shadow: 0px 0px .9310142993927002px 0px rgba(0, 0, 0, .17), 0px 0px 3.1270833015441895px 0px rgba(0, 0, 0, .08), 0px 7px 14px 0px rgba(0, 0, 0, .05);
        z-index: 3;
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        grid-gap: 1rem;
        align-items: flex-start;
        cursor: default;
        width: inherit;
    }
    &--body {
        height: 100%;
    }
}

</style>
