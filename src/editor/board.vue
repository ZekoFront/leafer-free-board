<template>
    <div class="leafer-free-board--root">
        <div class="leafer-free-board--header">
            <HeaderLeft :editor="editorBoard"></HeaderLeft>
            <ToolBar :editorBoard="editorBoard"></ToolBar>
            <HeaderRight :editor="editorBoard"></HeaderRight>
        </div>
        <div id="leafer" ref="boardRef" class="leafer-free-board--body"></div>
        <ElementAttributes :editor="editorBoard"></ElementAttributes>
    </div>
</template>
<script setup lang="ts">
import { App, version } from "leafer-ui";
import "@leafer-in/editor";
import "@leafer-in/viewport";
import "@leafer-in/text-editor";
import ElementAttributes from "./components/ElementAttributes.vue";
import HeaderLeft from "./components/HeaderLeft.vue";
import HeaderRight from "./components/HeaderRight.vue";
import "@leafer-in/find";
import "@leafer-in/export";
import "@leafer-in/view";
import {
    SnapPlugin,
    RulerPlugin,
    ScrollBarPlugin,
    ShapePlugin,
    DeleteHotKeyPlugin,
    CopyPlugin,
    DotMatrixPlugin,
    HistoryHotKeyPlugin,
} from "@/editor/plugins";
import { EditorBoard } from "@/editor";
import ToolBar from "./components/ToolBar.vue";
import { ExecuteTypeEnum } from "./types";
import { useBoardStore } from "./stores/useBoardStore";
import { CustomEvent, drawBoxText } from "@/editor/utils";
import { debounce } from "lodash-es";
import "@/editor/bridge/proxyData";

const boardRef = useTemplateRef<HTMLDivElement>("boardRef");
let app: App = {} as App;

const editorBoard: EditorBoard = new EditorBoard();
const boardStore = useBoardStore();

const autoSave = debounce(() => {
    try {
        const snapshot = editorBoard.saveBoard();
        boardStore.save(snapshot);
    } catch (err) {
        console.error("[Board] 自动保存失败:", err);
    }
}, 1000);

function initDefaultElements() {
    const text = drawBoxText({ x: 100, y: 100 }, { fontColor: "#FFFFFF" });
    editorBoard.addLeaferElement(text);
    editorBoard.history.execute({ executeType: ExecuteTypeEnum.AddElement, element: text });
}

onMounted(() => {
    app = new App({
        view: boardRef.value!,
        ground: { fill: "#e5e7eb" },
        tree: { type: "design" },
        editor: {
            point: { cornerRadius: 0 },
            middlePoint: {},
            rotatePoint: { width: 16, height: 16, cursor: "all-scroll" },
            rect: { dashPattern: [3, 2] },
            buttonsDirection: "top",
        },
        sky: {},
        fill: "#fafafa",
        touch: { preventDefault: false },
        pointer: { preventDefaultMenu: true },
    });

    editorBoard.init(app);
    editorBoard.use(SnapPlugin);
    editorBoard.use(RulerPlugin);
    editorBoard.use(ScrollBarPlugin);
    editorBoard.use(DotMatrixPlugin);
    editorBoard.use(DeleteHotKeyPlugin);
    editorBoard.use(CopyPlugin);
    editorBoard.use(HistoryHotKeyPlugin);
    editorBoard.use(ShapePlugin);

    editorBoard.on(CustomEvent.CHANGE, autoSave);

    const snapshot = boardStore.load();
    if (snapshot && snapshot.canvas?.length > 0) {
        editorBoard.loadBoard(snapshot);
    } else {
        initDefaultElements();
    }
});

onBeforeUnmount(() => {
    autoSave.cancel();
    editorBoard.off(CustomEvent.CHANGE, autoSave);
    boardStore.clear();
    editorBoard.destroy();
});

provide("editorBoard", editorBoard);
console.log("leaferjs:", version);
</script>
<style lang="scss">
@use "./css/index.scss";
</style>
