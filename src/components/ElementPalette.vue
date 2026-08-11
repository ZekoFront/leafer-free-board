<template>
    <aside class="element-palette">
        <header class="element-palette__header">
            <h3 class="element-palette__title">元素库</h3>
            <p class="element-palette__hint">拖到画布，或点击添加</p>
        </header>

        <n-collapse
            class="element-palette__collapse"
            :default-expanded-names="defaultExpanded"
            arrow-placement="right"
        >
            <n-collapse-item
                v-for="group in elementPaletteGroups"
                :key="group.key"
                :title="group.title"
                :name="group.key"
            >
                <div class="element-palette__grid">
                    <button
                        v-for="item in group.items"
                        :key="item.type"
                        type="button"
                        class="element-palette__item"
                        :title="`${item.title} — 拖到画布使用 line/curve 可连线`"
                        draggable="true"
                        @dragstart="onDragStart($event, item.type)"
                        @click="addElement(item.type)"
                    >
                        <PalettePreviewIcon
                            :preview="item.preview"
                            class="element-palette__preview"
                        />
                        <span class="element-palette__label">{{ item.title }}</span>
                    </button>
                </div>
            </n-collapse-item>
        </n-collapse>
    </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { elementPaletteGroups } from "@/config/element-palette";
import { createElement, getViewportDropPoint } from "@/core/elements";
import useSelectorListen from "@/hooks/useSelectorListen";
import { useThemeStore } from "@/theme";
import PalettePreviewIcon from "@/components/PalettePreviewIcon.vue";

const { editor } = useSelectorListen();
const { elementTheme } = storeToRefs(useThemeStore());

const defaultExpanded = elementPaletteGroups.map((g) => g.key);

/** 与 ShapePlugin drop 协议一致：dataTransfer 携带 type */
const onDragStart = (e: DragEvent, type: string) => {
    e.dataTransfer?.setData("type", type);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
};

/** 点击：在视口中心添加元素（HistoryPlugin 自动记录 ADD） */
let addIndex = 0;
const addElement = (type: string) => {
    const point = getViewportDropPoint(editor.app, addIndex++ % 5);
    const shape = createElement(type, point);
    if (!(shape as { tag?: string }).tag) return;
    editor.app.tree.add(shape);
};
</script>

<style lang="scss" scoped>
.element-palette {
    width: 200px;
    max-width: 200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
    background: #fafbfc;
    border-right: 1px solid #e8eaed;
    flex-shrink: 0;
    z-index: 2;

    &__header {
        padding: 12px 12px 8px;
        border-bottom: 1px solid #eef0f2;
        flex-shrink: 0;
    }

    &__title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
    }

    &__hint {
        margin: 4px 0 0;
        font-size: 11px;
        color: #9ca3af;
        line-height: 1.4;
    }

    &__collapse {
        flex: 1;
        min-width: 0;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 4px 6px 12px;

        :deep(.n-collapse-item) {
            margin-left: 0;
            margin-right: 0;
        }

        :deep(.n-collapse-item__header) {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            padding-left: 4px !important;
            padding-right: 4px !important;
        }

        :deep(.n-collapse-item__content-wrapper) {
            overflow: hidden;
        }

        :deep(.n-collapse-item__content-inner) {
            padding-left: 4px !important;
            padding-right: 4px !important;
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 2px;
        width: 100%;
        box-sizing: border-box;
        padding: 0 0 4px;
    }

    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-width: 0;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding: 4px 2px;
        border: none;
        border-radius: 4px;
        background: transparent;
        cursor: grab;
        overflow: hidden;
        transition: background 0.15s;

        &:hover {
            background: v-bind("elementTheme.palette.hoverBackground");

            .element-palette__label {
                color: v-bind("elementTheme.palette.hoverText");
            }
        }

        &:active {
            cursor: grabbing;
        }
    }

    &__preview {
        flex-shrink: 0;
    }

    &__label {
        width: 100%;
        max-width: 100%;
        font-size: 9px;
        color: #6b7280;
        text-align: center;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.15s;
    }
}
</style>
