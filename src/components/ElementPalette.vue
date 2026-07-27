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
                        <span
                            class="element-palette__preview"
                            :class="`element-palette__preview--${item.preview}`"
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
        width: 28px;
        height: 20px;
        flex-shrink: 0;
        display: block;
        overflow: hidden;

        &--rect {
            background: v-bind("elementTheme.fill");
            border-radius: 2px;
        }

        &--rounded-rect {
            background: v-bind("elementTheme.fill");
            border-radius: 6px;
        }

        &--circle {
            background: v-bind("elementTheme.fill");
            border-radius: 50%;
        }

        &--ellipse {
            background: v-bind("elementTheme.fill");
            border-radius: 50%;
            transform: scaleY(0.65);
        }

        &--diamond {
            width: 16px;
            height: 16px;
            margin: 2px auto;
            background: v-bind("elementTheme.fill");
            transform: rotate(45deg);
            border-radius: 2px;
        }

        &--triangle {
            width: 0;
            height: 0;
            margin: 0 auto;
            border-left: 11px solid transparent;
            border-right: 11px solid transparent;
            border-bottom: 18px solid v-bind("elementTheme.fill");
            background: transparent;
        }

        &--pentagon,
        &--hexagon {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }

        &--hexagon {
            clip-path: polygon(
                25% 0%,
                75% 0%,
                100% 50%,
                75% 100%,
                25% 100%,
                0% 50%
            );
        }

        &--star {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(
                50% 0%,
                61.2% 34.5%,
                97.6% 34.5%,
                68.2% 55.9%,
                79.4% 90.5%,
                50% 69.1%,
                20.6% 90.5%,
                31.8% 55.9%,
                2.4% 34.5%,
                38.8% 34.5%
            );
        }

        &--star-4 {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(
                50% 0%,
                67.7% 32.3%,
                100% 50%,
                67.7% 67.7%,
                50% 100%,
                32.3% 67.7%,
                0% 50%,
                32.3% 32.3%
            );
        }

        &--star-6 {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(
                50% 0%,
                62.5% 28.3%,
                93.3% 25%,
                75% 50%,
                93.3% 75%,
                62.5% 71.7%,
                50% 100%,
                37.5% 71.7%,
                6.7% 75%,
                25% 50%,
                6.7% 25%,
                37.5% 28.3%
            );
        }

        &--star-7 {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(
                50% 0%,
                60.8% 27.5%,
                89.1% 18.8%,
                74.4% 44.4%,
                98.7% 61.1%,
                69.5% 65.6%,
                71.7% 95%,
                50% 75%,
                28.3% 95%,
                30.5% 65.6%,
                1.3% 61.1%,
                25.6% 44.4%,
                10.9% 18.8%,
                39.2% 27.5%
            );
        }

        &--star-8 {
            background: v-bind("elementTheme.fill");
            clip-path: polygon(
                50% 0%,
                59.6% 26.9%,
                85.4% 14.6%,
                73.1% 40.4%,
                100% 50%,
                73.1% 59.6%,
                85.4% 85.4%,
                59.6% 73.1%,
                50% 100%,
                40.4% 73.1%,
                14.6% 85.4%,
                26.9% 59.6%,
                0% 50%,
                26.9% 40.4%,
                14.6% 14.6%,
                40.4% 26.9%
            );
        }

        &--star-rounded {
            background: v-bind("elementTheme.fill");
            border-radius: 3px;
            clip-path: polygon(
                50% 0%,
                62% 25%,
                95% 25%,
                68% 45%,
                80% 85%,
                50% 62%,
                20% 85%,
                32% 45%,
                5% 25%,
                38% 25%
            );
        }

        &--text {
            background: transparent;
            border: 1px dashed v-bind("elementTheme.fill");
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: v-bind("elementTheme.fill");

            &::after {
                content: "T";
                font-weight: 700;
            }
        }

        &--mind-topic {
            background: v-bind("elementTheme.fill");
            border-radius: 6px;
            box-shadow: inset 0 0 0 2px v-bind("elementTheme.strokeDark");
        }

        &--mind-sub {
            background: v-bind("elementTheme.mindSub.fill");
            border-radius: 5px;
            box-shadow: inset 0 0 0 2px v-bind("elementTheme.mindSub.stroke");
        }
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
