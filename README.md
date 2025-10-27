# Vue 3 + TypeScript + Vite

# leafer-free-board
A lightweight free board library with Vue3 + Leafer. Supports drag-and-drop, flexible layout &amp; editing—great for sketching, prototyping.

# 创建leafer引擎
拖拽开始和结束事件正常触发
```js
const leafer = new Leafer({ view: boardRef.value! })
leafer.on(DragEvent.START, (evt:DragEvent) => {
    // this.dragElement = cloneDeep(evt.target)
    console.log('DragEvent.START', JSON.stringify(evt.target) )
});
leafer.on(DragEvent.END, (evt:DragEvent) => {
    console.log('DragEvent.END', evt.target)
});
```

# 创建APP引擎
```js
const app = new App({
    view: view,
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

// 拖拽元素事件监听
// 监听app层，引擎拖拽事件正常触发，监听editor第一次拖拽不触发，第二次触发
app.on(DragEvent.START, (evt:DragEvent) => {
    // this.dragElement = cloneDeep(evt.target)
    console.log('DragEvent.START', JSON.stringify(evt.target))
});
app.on(DragEvent.END, (evt:DragEvent) => {
    console.log('DragEvent.END', JSON.stringify(evt.target))
});
```

# 取消选中元素
取消已选择元素
```js
this.app.editor.cancel()

// 可选：监听其他需要的事件
// this.app.editor.on(EditorMoveEvent.MOVE, onDragEvent);
```

