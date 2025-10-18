<template>
<button @click="exportBoard">导出图片</button>
<button @click="exportBoardJSON">导出JSON</button>
<button @click="undo">撤销</button>
<button @click="redo">重做</button>

<div ref="boardRef" style="height: calc(100vh - 50px);width: 100%;background-color:#e2e2e2;"></div>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
import { App, Rect, Text, version, PointerEvent, type IUI, MoveEvent, ZoomEvent, DragEvent, type IUIInputData, RenderEvent, LeaferEvent, PropertyEvent, ChildEvent } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件
import "@leafer-in/find" // 导入查早元素插件
import { Editor, EditorEvent } from '@leafer-in/editor';
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
    app.tree.syncExport('leafer.png',{ pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 })
}

const exportBoardJSON = () => {
    const json = app.tree.toJSON()
    console.log(json)
}

// 实例化撤销管理器
interface IHistory {
    id: string,
    value: string
}
// 最多保留20条最新记录
const MAX_HISTORY_SIZE = 20; 
const undoManager = new UndoManager();
// 设置最大撤销步数。默认值：0（无限制）
undoManager.setLimit(15);
// 测试数组数据
const historyRecords: IHistory[] = [];
 
function addHistory(value: IHistory) {
    historyRecords.push(value);
    forceRender()
}
function removeHistory(id: string) {
    var i = 0, index = -1;
    for (i = 0; i < historyRecords.length; i += 1) {
        const item = historyRecords[i] as IHistory;
        if(item && item.id === id) {
            index = i;
        }
    }
    if (index !== -1) {
        historyRecords.splice(index, 1);
        forceRender()
    }
}
 
function createHistory(value: IHistory) {
    historyRecords.push(value);
    // 若超过最大限制，删除最旧的一条（数组第一条）
    if (historyRecords.length > MAX_HISTORY_SIZE) {
        // 移除最旧的记录（index=0）
        historyRecords.shift();
    }

    undoManager.add({
        undo: () => removeHistory(value.id||""),
        redo: () => addHistory(value)
    });
}

function forceRender() {
    if (historyRecords.length) {
        const lastItem = historyRecords[historyRecords.length - 1]
        if (lastItem) {
            const { value } = lastItem
            if (value) {
                app.tree.set(JSON.parse(value) as IUIInputData)
                // app.forceRender()
                const selectedId = selectedUI.value.id;
                const selectedElement = app.tree.children.find(el => el.id ===selectedId);
                if (selectedElement) {
                    app.editor.select(selectedElement)
                }
            }
        }
    }
}

console.log(historyRecords)

// 撤销操作
function undo() {
    const hasUndo = undoManager.hasUndo();
    if (hasUndo) {
        undoManager.undo();
        console.log("撤销操作后:", historyRecords);
    }
}

// 重做操作
function redo() {
    const hasRedo = undoManager.hasRedo();
    if (hasRedo) {
        undoManager.redo();
        console.log("重做操作后:", historyRecords);
    }
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
    // 添加图形编辑器，用于选中元素进行编辑操作
    // 会导致多选拖拽出现多余选择框
    // app.editor = new Editor()
    // app.sky.add(app.editor)

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
    app.tree.add(text)

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
            console.log('SELECT:',evt.value)
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
    // 开始拖拽事件
    app.tree.on(DragEvent.START, (e: DragEvent) => {
        // createHistory(uuidv4(), app.tree.toString())
        createHistory({ id: uuidv4(), value: app.tree.toString() })
        console.log('拖动开始:', historyRecords)
    })
    // 结束拖动事件, 拖拽开始没有做任何改变，结束后数据才会改变
    app.tree.on(DragEvent.END, (e: DragEvent) => {
        // createHistory(uuidv4(), app.tree.toString())
        createHistory({ id: uuidv4(), value: app.tree.toString() })
        console.log('拖动结束:', historyRecords)
    })

    // 监听渲染
    app.tree.on(LeaferEvent.READY, () => {
        console.log('Render-Over')
        app.tree.on(ChildEvent.ADD, () => {
            console.log('ChildEvent.ADD')
        })
    })
    console.log(app.tree.children)
})

console.log('leafer-ui-version:', version)
</script>
