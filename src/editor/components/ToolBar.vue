<template>
    <div class="center">
        <div draggable="true" v-for="(item, index) in toolbars" :key="item.type" :class="['icon-block', { 'active': currentIndex === index }]" :id="item.type" :title="item.title" @click="handleClick(item, index)">
            <component :is="item.icon"></component>
        </div>
        <div class="icon-block--undo" title="撤回" @click="editorBoard.history.undo()">
            <UndoIcon></UndoIcon>
        </div>
        <div class="icon-block--redo" title="重做" @click="editorBoard.history.redo()">
            <RedoIcon></RedoIcon>
        </div>
        <button @click="exportBoard">导出图片</button>
        <button @click="exportBoardJSON">导出JSON</button>
        <button @click="printHistory">打印历史记录</button>
    </div>
</template>

<script setup lang="ts">
import { PointerEvent, Text, Rect, Group, type IUI, Box } from 'leafer-ui';
import { EditorBoard } from '..'
import { RectIcon, RedoIcon, UndoIcon, TextIcon, SelectIcon } from '@/icons'
import type { IPointItem, IToolBar } from '../types'

defineOptions({ name: 'ToolBar' })

const props = defineProps({
    editorBoard: {
        type: EditorBoard,
        default: () => {}
    }
})

const currentIndex = ref<number>(0)
const toolbars = shallowRef<IToolBar[]>([
    {
        icon: SelectIcon,
        title: '选择',
        type: 'select'
    },
    {
        icon: RectIcon,
        title: '矩形',
        type: 'rect'
    },
    {
        icon: TextIcon,
        title: '文本',
        type: 'text'                        
    }
])

const handleClick = (item: IToolBar, index: number) => {
    console.log(item, index)
}

const exportBoard = () => {
    props.editorBoard.app.tree.syncExport('leafer.png',{ pixelRatio: 3, screenshot: false, fill: '#ffffff', quality: 0.9, padding: 10 })
}

const exportBoardJSON = () => {
    const json = props.editorBoard.app.tree.toJSON()
    console.log(json)
}

const printHistory = () => {
    // 添加历史记录
    console.log('历史记录:', props.editorBoard.history.state())
}

const options = {
    fill: '#FEB027',
    stroke: '#13ad8cff',
    cornerRadius: 10,
    opacity: 0.7,
}
let leafer:HTMLDivElement|undefined;
const onDropLeafer = (e:DragEvent) => {
    if (e.dataTransfer) {
        const type = e.dataTransfer.getData("type")
        // 浏览器原生事件的 client 坐标 转 应用的 page 坐标
        const point = props.editorBoard.app.getPagePointByClient(e)
        // 根据拖拽类型生成图形
        console.log(type,point)
        if (type === 'rect') {
            // const rect = new Rect({
            //     editable: false,
            //     fill: options.fill,
            //     cornerRadius: options.cornerRadius,
            //     opacity: options.opacity,
            // })

            // const text = new Text({
            //     draggable: false,
            //     editable: true,
            //     text: '矩形',
            //     fill: '#333',
            //     fontSize: 12,
            //     fontWeight: 'bold',
            //     textAlign: 'center',
            //     verticalAlign: 'middle',
            //     x: 10,
            //     y: 10,
            // })

            // const group = new Group({
            //     editable: true,
            //     draggable: true,
            //     x: point.x,
            //     y: point.y,
            //     children: [rect, text],
            // })
            // Box 不设置宽高时，将自适应内容
            const box = new Box({
                x: point.x,
                y: point.y,
                fill: '#FFFFFF',
                cornerRadius: 20,
                textBox: true,
                hitChildren: false, // 阻止直接选择子元素（防止父子选择冲突，可双击进入组内选择子元素）
                editable: true,
                resizeChildren: true, // 同时 resize 文本
                strokeWidth: 1,
                stroke: "#32cd79",
                children: [{
                    tag: 'Text',
                    text: 'Welcome to LeaferJS',
                    fill: 'black',
                    fontSize: 16,
                    padding: [10, 20],
                    textAlign: 'left',
                    verticalAlign: 'top'
                }]
            })
            // 添加图形到画布
            props.editorBoard.app.tree.add(box)
        } else if (type === 'text') {
            const text = new Text({
                fill: '#333333',
                placeholder: '请输入文本', // 占位符文本  
                placeholderColor: 'rgba(120,120,120,0.5)',  // 占位符颜色
                draggable: true,
                fontSize: 16,
                padding: 12,
                boxStyle: {
                    padding: 12
                },
                editable: true,
                x: point.x,
                y: point.y
            })
            props.editorBoard.app.tree.add(text)
        }
    }
    e.preventDefault()
}

const onDragElementListener = (type: string) => {
    const element = document.getElementById(type)
    element&&element.addEventListener('dragstart', function (e:DragEvent) {
        e.dataTransfer&&e.dataTransfer.setData("type", type)
    })
}
const onDragElementRemoveListener = (type: string) => {
    const element = document.getElementById(type)
    element&&element.removeEventListener('dragstart', function (e:DragEvent) {
        e.dataTransfer&&e.dataTransfer.setData("type", type)
    })
}

onMounted(() => {
    // 监听拖拽元素
    toolbars.value.forEach(item => {
        onDragElementListener(item.type)
    })

    leafer = document.getElementById('leafer') as HTMLDivElement
    leafer&&leafer.addEventListener('dragover', function (e:DragEvent) {
        e.preventDefault()
    })

    // 设置目标区域可接收拖拽
    leafer&&leafer.addEventListener('drop', onDropLeafer)
})

onBeforeUnmount(() => {
    // 移除监听拖拽元素
    toolbars.value.forEach(item => {
        onDragElementRemoveListener(item.type)
    })
    // 移除监听
    leafer&&leafer.removeEventListener('drop', onDropLeafer)
})
</script>
