<template>
<button @click="exportBoard">导出图片</button>
<button @click="exportBoardJSON">导出JSON</button>
<button @click="testUndo">撤销</button>
<button @click="testRedo">重做</button>

<div ref="boardRef" style="height: calc(100vh - 50px);width: 100%;background-color:#e2e2e2;"></div>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
import { App, Rect, Text, version, PointerEvent, type IUI, MoveEvent, ZoomEvent, DragEvent, type IUIInputData } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件
import { EditorEvent } from '@leafer-in/editor';
import { Snap } from 'leafer-x-easy-snap'
import { Ruler } from 'leafer-x-ruler'
import '@leafer-in/export' // 引入导出元素插件
import { ScrollBar } from '@leafer-in/scroll' // 导入滚动条插件 
import { UndoManager } from '@/utils/UndoManager'
import { v4 as uuidv4 } from 'uuid'

const boardRef = useTemplateRef<HTMLDivElement>('boardRef')
const selectedUI = ref<IUI>({} as IUI)
let app: App = {} as App

const exportBoard = () => {
    app.tree.syncExport('leafer.png',{ pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9 })
}

const exportBoardJSON = () => {
    const json = app.tree.toJSON()
    console.log(json)
}

// 实例化撤销管理器

const undoManager = new UndoManager();
const historyRecords: Record<string, string> = {};
 
function addHistory(key: string, value: string) {
  historyRecords[key] = value;
}
 
function removeHistory(key: string) {
  delete historyRecords[key];
}
 
function createHistory(key: string, value: string) {
  addHistory(key, value);
  undoManager.add({
    undo: () => removeHistory(key),
    redo: () => addHistory(key, value)
  });
}
 
createHistory(uuidv4(), "张三");
createHistory(uuidv4(), "李四");


console.log(historyRecords)

// 测试撤销操作
function testUndo() {
  undoManager.undo();
  // 转换为数组：每个元素包含原键（id）和值（name）
    const arr = Object.entries(historyRecords).map(([id, name]) => ({
        id: id,
        name: name
    }));
    // 获取数组最后一个元素
    // const lastItem = arr[arr.length - 1]
    // app.tree.set({ children: [JSON.parse(String(lastItem&&lastItem.name))]})
    // console.log('转换后数组:', JSON.parse(String(lastItem&&lastItem.name)))
    console.log("撤销操作后:", historyRecords);
}

// 测试重做操作
function testRedo() {
  undoManager.redo();
  console.log("重做操作后:", historyRecords);
}



nextTick(() => {
    app = new App({
        view: boardRef.value!,
        ground: {
           fill: '#91124c'
        },
        editor: {},
        tree: {
            type: 'design',
        },
        sky: { },  // 添加 sky 层
        fill: '#ffffff', // 背景色
        // wheel: { zoomMode: true, preventDefault: true }, // 全局鼠标滚动缩放元素
        touch: { preventDefault: true }, // 阻止移动端默认触摸屏滑动页面事件
        pointer: { preventDefaultMenu: true } // 阻止浏览器默认菜单事件
    })

    // 启用easy-snap吸附插件
    const snap = new Snap(app)
    snap.enable(true)

    // 实例化标尺插件
    const ruler = new Ruler(app)
    ruler.enabled = true

    // 启用滚动插件
    new ScrollBar(app)

    // 创建画板
    const text = Text.one({
        text: 'Action is the proper fruit of knowledge.',
        editable: true, fill: '#FFE04B', fontSize: 16,
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
    app.tree.add(text)

    const rect = Rect.one({
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
    app.tree.add(rect)
    
    rect.on(PointerEvent.ENTER, onEnter)
    rect.on(PointerEvent.LEAVE, onLeave)

    function onEnter(e: PointerEvent) {
        if (e.current) {
            (e.current as Rect).fill = '#FFE04B'
        }
    }

    function onLeave(e: PointerEvent) {
        if (e.current) {
             (e.current as Rect).fill = '#32cd79'
        }
    }

    // 监听选择事件
    app.editor.on(EditorEvent.SELECT, (evt: EditorEvent) => {
        if (evt.value) {
            // 获取选中的元素
            selectedUI.value = evt.value as IUI
            // 修改填充颜色
            // selectedUI.value.fill = 'blue'
            // 修改选中元素的圆角：[topLeft, topRight, bottomRight, bottomLeft]
            // selectedUI.value.cornerRadius = [10, 10, 10, 10]
            // 打印选中元素的tag类型：selectedUI.value.tag
            console.log('SELECT:',evt.value, selectedUI.value.tag)
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

    // 收集历史记录
    // 结束拖动事件, 拖拽开始没有做任何改变，结束后数据才会改变
    app.tree.on(DragEvent.END, (e: DragEvent) => {
        createHistory(uuidv4(), app.editor.toString())
        console.log('拖动结束:', historyRecords)
    })
    console.log(app.tree.children)
})

console.log('leafer-ui-version:', version)
</script>
