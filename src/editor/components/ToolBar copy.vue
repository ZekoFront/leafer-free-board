<template>
    <div class="center">
        <div v-for="(item, index) in toolbars" :key="item.type" :class="['icon-block', { 'active': currentIndex === index }]" :title="item.title" @click="handleClick(item, index)">
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
import { PointerEvent, Text, Rect, Group, type IUI, type IPointData } from 'leafer-ui';
import { EditorBoard } from '..'
import { RectIcon, RedoIcon, UndoIcon, TextIcon, SelectIcon } from '@/assets/icons'
import type { IToolBar } from '../types'

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

const selectType = ref('')
const handleClick = (item: IToolBar, index: number) => {
    console.log(item, index)
    currentIndex.value = index
    selectType.value = item.type
    if (item.type === 'rect') {
        props.editorBoard.app.cursor = 'crosshair'
        props.editorBoard.app.editor.config.selector = false
        // props.editor.setCurrentTool('rect')
    } else if (item.type === 'text') {
        // props.editor.setCurrentTool('text')
        props.editorBoard.app.cursor = 'crosshair'
        props.editorBoard.app.editor.config.selector = false
    } else if (item.type === 'select') {
        props.editorBoard.app.cursor = 'default'
        props.editorBoard.app.editor.config.selector = true
    }
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

const isDragging = ref(false)
const isMouseDown = ref(false)
const points = ref<IPointData[]>([])
let element:IUI = {} as IUI
const options = {
    fill: '#FEB027',
    stroke: '#13ad8cff',
    cornerRadius: 10,
    opacity: 0.7,
}
// PointerEvent.MENU支持右键菜单
// 鼠标按下事件
const onDown = (e: PointerEvent) => {
    console.log('鼠标按下事件', e)
    isMouseDown.value = true
    // 取消选中
    if (props.editorBoard.app.editor&&props.editorBoard.app.cursor === 'crosshair') {
        props.editorBoard.app.editor.target = undefined
    }

    // 获取起始坐标
    const startPoint = e.getPagePoint()
    points.value.push(startPoint)
    if (selectType.value === 'rect') {
        element = createElement(startPoint)
    }
}

// 鼠标移动事件
const onMove = (e: PointerEvent) => {
    if (!isDragging.value && props.editorBoard.app.cursor === 'crosshair'&&element.x) {
        isDragging.value = true
        console.log(element, 5555)
        // 关闭选择器
        props.editorBoard.app.tree.add(element)
    }
    if (isDragging.value && isMouseDown.value && selectType.value === 'rect') {
        const endPoint = e.getPagePoint()
        console.log('鼠标移动事件', endPoint)
        // 更新元素位置
        updateElement(element, endPoint)
        // 计算偏移量
        // const offsetX = endPoint.x - startPoint.value.x
        // const offsetY = endPoint.y - startPoint.value.y
        // console.log('偏移量:', offsetX, offsetY)
    }
}

// 鼠标松开事件
const onUp = (e: PointerEvent) => {
    if (props.editorBoard.app.cursor === 'crosshair') {
        isDragging.value = false
        isMouseDown.value = false
        console.log('鼠标松开事件', e)
        points.value = []
        // 开启选择器
        props.editorBoard.app.editor.config.selector = true
        props.editorBoard.app.cursor = 'default'
        currentIndex.value = 0
    }
}

// 创建图形
const createElement = (startPoint: IPointData): IUI => {
    const rect = new Rect({
        editable: false,
        fill: options.fill,
        cornerRadius: options.cornerRadius,
        opacity: options.opacity,
    })

    const text = new Text({
        draggable: false,
        editable: true,
        text: '矩形',
        fill: '#333',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        verticalAlign: 'middle',
        x: 10,
        y: 10,
    })

    const group = new Group({
        editable: true,
        draggable: true,
        x: startPoint.x,
        y: startPoint.y,
        children: [rect, text],
    })

    return group
}

const updateElement = (element: IUI, endPoint: IPointData) => {
    points.value[1] = endPoint

    const startPoints = points.value[0]
    const group = element as Group
    const bounds = calculateRectBounds(startPoints as IPointData, endPoint)
    const { x, y, width, height } = bounds
    group.x = x
    group.y = y

    const [rect, text] = group.children
    if (rect && text) {
        rect.width = width
        rect.height = height

        text.width = Math.abs(width - 20)
        text.height = Math.abs(height - 20)
    }
}

const calculateRectBounds = (startPoint: IPointData, endPoint: IPointData) => {
    const { x: startX, y: startY } = startPoint
    const { x: endX, y: endY } = endPoint
    const deltaX = endX - startX
    const deltaY = endY - startY

    const width = Math.abs(deltaX)
    const height = Math.abs(deltaY)

    let x = 0
    let y = 0

    if (deltaX >= 0 && deltaY >= 0) {
      // 右下方向
      x = startX
      y = startY
    } else if (deltaX < 0 && deltaY >= 0) {
      // 左下方向
      x = startX + deltaX
      y = startY
    } else if (deltaX >= 0 && deltaY < 0) {
      // 右上方向
      x = startX
      y = startY + deltaY
    } else {
      // 左上方向
      x = startX + deltaX
      y = startY + deltaY
    }

    return {
      x,
      y,
      width,
      height,
    }
  }


// 后期移动到插件DrawShapePlugin内部实现
nextTick(() => {
    // 绑定鼠标事件
    props.editorBoard.app.on(PointerEvent.DOWN, onDown)
    props.editorBoard.app.on(PointerEvent.MOVE, onMove)
    props.editorBoard.app.on(PointerEvent.UP, onUp)
})
</script>
