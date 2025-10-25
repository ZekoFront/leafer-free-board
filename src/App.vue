<template>
<button @click="exportBoard">导出图片</button>
<button @click="exportBoardJSON">导出JSON</button>
<button @click="editorBoard.history.undo">撤销</button>
<button @click="editorBoard.history.redo">重做</button>
<button @click="printHistory">打印历史记录</button>
<div ref="boardRef" style="height: calc(100vh - 50px);width: 100%;background-color:#e2e2e2;"></div>
</template>

<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import { App, Rect, Text, version, PointerEvent, type IUI, MoveEvent, ZoomEvent, LeaferEvent } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件
import "@leafer-in/find" // 导入查早元素插件
import { EditorEvent, EditorMoveEvent } from '@leafer-in/editor';
import '@leafer-in/export' // 引入导出元素插件
import { v4 as uuidv4 } from 'uuid'
import { debounce } from 'lodash-es'
import { createEditorBoard } from './editor';
import type EditorBoard from '@/editor/EditorBoard';
import { ExecuteTypeEnum } from './editor/types';

const boardRef = useTemplateRef<HTMLDivElement>('boardRef')
const selectedUI = ref<IUI>({} as IUI)
let app: App = {} as App
let editorBoard: EditorBoard = {} as EditorBoard

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

nextTick(() => {
    // 创建画板
    editorBoard = createEditorBoard(boardRef.value!)
    app = editorBoard.app

    const text = Text.one({
        id: uuidv4(),
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
    // app.tree.add(text)
    editorBoard.addLeaferElement(text)
    editorBoard.history.execute(text)

    const rect = Rect.one({
        id: uuidv4(),
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
    // app.tree.add(rect)
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

    // 监听选择事件
    app.editor.on(EditorEvent.SELECT, (evt: EditorEvent) => {
        if (evt.value) {
            // app.editor.target 选中目标，数组或者对象
            const selected = app.editor.target
            // 获取选中的元素
            selectedUI.value = evt.value as IUI
            // 修改填充颜色
            // selectedUI.value.fill = 'blue'
            // 修改选中元素的圆角：[topLeft, topRight, bottomRight, bottomLeft]
            // selectedUI.value.cornerRadius = [10, 10, 10, 10]
            // 打印选中元素的tag类型：selectedUI.value.tag
            if (Array.isArray(selected)) {
                // console.log('SELECT:', selected)
            }
            else {
                // 修改属性
                if (selected) {
                    // 修改颜色
                    // selected.fill = 'blue'
                    // selected.setAttr('fill', 'blue')
                }
                // console.log('SELECT:', selected, app.editor, '图层序号:', selected?.innerId)
            }
        }
    })

    // 平移视图 
    app.tree.on(MoveEvent.BEFORE_MOVE, (e: MoveEvent) => {
        // console.log('BEFORE_MOVE:', e.moveX, e.moveY)
        app.tree.zoomLayer.move(app.tree.getValidMove(e.moveX, e.moveY))
    })

    // 缩放视图
    app.tree.on(ZoomEvent.BEFORE_ZOOM, (e: ZoomEvent) => {
        // console.log('BEFORE_ZOOM:', e.scale)
        app.tree.zoomLayer.scaleOfWorld(e, app.tree.getValidScale(e.scale))
    })

    // 收集历史记录事件监听
    // const onDragEvent = debounce((evt: EditorMoveEvent) => {
    //     app.editor.cancel()
    //     // editorBoard.createHistory({ id: uuidv4(), value: app.tree.toJSON() })
    //     console.log('EditorMoveEvent11')
    // }, 500);
    // 移动元素事件监听
    // app.editor.on(EditorMoveEvent.MOVE, onDragEvent)
        
    console.log("内容层元素:",app.tree.children)
})
console.log('leafer-ui-version:', version)
</script>
