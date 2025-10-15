<template>
<div ref="boardRef" style="height: calc(100vh - 24px);width: 100%;"></div>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
import { App, Rect, Text, version } from 'leafer-ui';
import '@leafer-in/editor' // 导入图形编辑器插件  
import '@leafer-in/viewport' // 导入视口插件（可选）
import '@leafer-in/text-editor' // 导入文本编辑插件 //

const boardRef = useTemplateRef<HTMLDivElement>('boardRef')

nextTick(() => {
    const app = new App({
        view: boardRef.value!,
        editor: {},
        tree: {
            type: 'design'
        }
    })

    app.tree.add(Text.one({
        text: 'Action is the proper fruit of knowledge.',
        editable: true, fill: '#FFE04B', fontSize: 16,
        draggable: true
    }, 100, 100, 100))

    app.tree.add(Rect.one({
        x: 100,
        y: 10,
        width: 100,
        height: 100,
        stroke: '#32cd79',
        strokeWidth: 2,
        fill: '#32cd79',
        draggable: true,
        editable: true,
        dashPattern: [6, 6] // 绘制虚线
    }, 300, 100, 100))
})

console.log('leafer-ui-version:', version)
</script>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
