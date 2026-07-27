<template>
    <div class="center">
        <div class="center-tool-bar-wrapper default-shadow__wrapper">
            <div v-for="(item, index) in toolbars" :key="item.type"
                :class="['icon-block', { active: currentIndex === index }]" :id="item.type" :title="item.title"
                :draggable="item.draggable" @dragstart="handleDragStart($event, item)"
                @mousedown="handleClick(item, index)" @click="handleClick(item, index)">
                <n-icon :size="22">
                    <component :is="item.icon"></component>
                </n-icon>
            </div>
            <div class="icon-block-blank">
                <n-icon :size="22" color="#b7b7b9">
                    <VerticalLineIcon></VerticalLineIcon>
                </n-icon>
            </div>
            <div class="icon-block" title="添加图片" @click="uploadImage">
                <n-icon :size="22">
                    <ImageAddIcon></ImageAddIcon>
                </n-icon>
            </div>
            <div :class="[
                'icon-block',
                'icon-block--undo',
                { disabled: !isCanUndo },
                { 'active-icon': isCanUndo },
            ]" title="撤销" @click="isCanUndo && undo()">
                <n-icon :size="22">
                    <UndoIcon></UndoIcon>
                </n-icon>
            </div>
            <div :class="[
                'icon-block',
                'icon-block--redo',
                { disabled: !iscanRedo },
                { 'active-icon': iscanRedo },
            ]" title="重做" @click="iscanRedo && redo()">
                <n-icon :size="22">
                    <RedoIcon></RedoIcon>
                </n-icon>
            </div>
            <div class="icon-block icon-block--redo" title="清空画布" @click="handleClear">
                <n-icon :size="22">
                    <ClearIcon></ClearIcon>
                </n-icon>
            </div>
            <div class="icon-block-blank">
                <n-icon :size="22" color="#b7b7b9">
                    <VerticalLineIcon></VerticalLineIcon>
                </n-icon>
            </div>
            <n-popover trigger="hover" placement="bottom" :width="240">
                <template #trigger>
                    <div class="icon-block" title="快捷键">
                        <n-icon :size="22">
                            <HotkeyIcon></HotkeyIcon>
                        </n-icon>
                    </div>
                </template>
                <div class="hotkey-panel">
                    <div class="hotkey-panel__title">快捷键</div>
                    <div class="hotkey-panel__item" v-for="item in hotkeyList" :key="item.label">
                        <span class="hotkey-panel__label">{{ item.label }}</span>
                        <span class="hotkey-panel__keys">
                            <kbd v-for="k in item.keys" :key="k">{{ k }}</kbd>
                        </span>
                    </div>
                </div>
            </n-popover>
            <button v-if="isDev" @click="printHistory">打印历史记录</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ImageEvent } from "leafer-ui";
import {
    RedoIcon,
    UndoIcon,
    VerticalLineIcon,
    ImageAddIcon,
    ClearIcon,
    HotkeyIcon,
} from "@/assets/icons";
import { type IDrawState, type IToolBar } from "@/core/types";
import { createImageFromUrl, getImageDropPoint } from "@/core/elements";
import { toolbarMenu } from "@/config";
import { useCanvasSnapshot } from "@/composables/useCanvasSnapshot";
import { useHistory } from "@/composables/useHistory";
import useSelectorListen from "@/hooks/useSelectorListen";
import { useNaiveDiscrete } from "@/hooks/useNaiveDiscrete";

const isDev = import.meta.env.DEV;
const snapshotStore = useCanvasSnapshot();
const { editor } = useSelectorListen();
const { canUndo: isCanUndo, canRedo: iscanRedo, undo, redo, clearHistory } = useHistory();
const { dialog, message } = useNaiveDiscrete();

const currentIndex = ref<number>(0);
const toolbars = shallowRef<IToolBar[]>(toolbarMenu);

const hotkeyList = [
    { label: "撤销", keys: ["Ctrl", "Z"] },
    { label: "重做", keys: ["Ctrl", "Y"] },
    { label: "复制", keys: ["Ctrl", "C"] },
    { label: "粘贴", keys: ["Ctrl", "V"] },
    { label: "删除元素", keys: ["Backspace / Delete"] },
    { label: "平移画布", keys: ["Space + 拖拽"] },
    { label: "缩放画布", keys: ["Ctrl + 滚轮"] },
];

const handleDragStart = (e: DragEvent, item: IToolBar) => {
    if (!item.draggable) return;
    e.dataTransfer?.setData("type", item.type);
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "copy";
    }
};

const handleClick = (item: IToolBar, index: number) => {
    if (item.draggable) return;
    currentIndex.value = index;
    editor.setToolbarActive(item.type, (state?: IDrawState) => {
        if (state?.type === item.type) {
            currentIndex.value = 0;
        }
    });
};

const handleClear = () => {
    dialog.warning({
        title: "警告",
        content: "清空画布后无法恢复，确定要清空吗？",
        positiveText: "确定",
        negativeText: "取消",
        draggable: true,
        onPositiveClick: () => {
            editor.runWithoutRecording?.(() => {
                editor.app.tree.clear();
            });
            clearHistory();
            snapshotStore.clear();
        },
        onNegativeClick: () => { },
    });
};

const uploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.style.display = "none";

    const cleanup = () => {
        input.remove();
    };

    input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files?.length) {
            cleanup();
            return;
        }
        Array.from(files).forEach((file, index) => {
            addImageFromFile(file, index);
        });
        cleanup();
    };

    // 用户取消选择时也移除临时 input
    input.addEventListener("cancel", cleanup, { once: true });

    document.body.appendChild(input);
    input.click();
};

/**
 * 导入单张图片到画布。
 * - 使用视口中心 + 偏移定位
 * - tree.add 后由 HistoryPlugin 的 ChildEvent.ADD 自动入栈，支持撤销
 */
const addImageFromFile = (file: File, index: number) => {
    if (!file.type.startsWith("image/")) {
        message.warning(`「${file.name}」不是支持的图片格式`);
        return;
    }

    const localUrl = URL.createObjectURL(file);
    const point = getImageDropPoint(editor.app, index);
    const image = createImageFromUrl(localUrl, point, file.name);

    image.once(ImageEvent.LOADED, () => {
        // 加载成功后释放 Object URL，Leafer 已持有解码后的图像数据
        URL.revokeObjectURL(localUrl);
    });

    image.once(ImageEvent.ERROR, () => {
        URL.revokeObjectURL(localUrl);
        if (image.parent) {
            image.remove();
        }
        message.error(`图片「${file.name}」加载失败`);
    });

    editor.app.tree.add(image);
};

const printHistory = () => {
    console.log("历史记录:", {
        canUndo: isCanUndo.value,
        canRedo: iscanRedo.value,
    });
};
</script>

<style lang="scss">
.hotkey-panel {
    &__title {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
        padding-bottom: 8px;
        margin-bottom: 6px;
        border-bottom: 1px solid #f0f0f0;
    }

    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 0;
    }

    &__label {
        font-size: 12px;
        color: #4b5563;
    }

    &__keys {
        display: flex;
        gap: 4px;

        kbd {
            display: inline-block;
            font-family: inherit;
            font-size: 11px;
            line-height: 1;
            padding: 3px 6px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            color: #374151;
            box-shadow: 0 1px 0 #d1d5db;
        }
    }
}
</style>
