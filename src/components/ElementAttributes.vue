<template>
    <transition name="fade-attr">
        <aside class="attr-panel" v-if="isSingle && selectedActive">
            <header class="attr-panel__header">
                <div class="attr-panel__meta">
                    <span class="attr-panel__badge">{{ elementTagLabel }}</span>
                    <span class="attr-panel__id" v-if="selectedActive.id">
                        #{{ shortId }}
                    </span>
                </div>
                <h3 class="attr-panel__title">属性</h3>
            </header>

            <n-tabs
                class="attr-panel__tabs"
                type="segment"
                size="small"
                animated
                :value="activeName"
                :on-update:value="handleClick"
            >
                <n-tab-pane name="setting" tab="设计">
                    <div class="attr-panel__pane">
                        <div class="attr-panel__scroll">
                        <!-- 文本 -->
                        <section v-if="selectedActive.tag === 'Text'" class="attr-section">
                            <h4 class="attr-section__title">文本</h4>
                            <div class="attr-section__body">
                                <div class="attr-row">
                                    <label class="attr-row__label">内容</label>
                                    <n-input
                                        class="attr-row__control"
                                        size="small"
                                        v-model:value="textContent"
                                        clearable
                                        :placeholder="(selectedActive as any).placeholder || '输入文本'"
                                        :on-update:value="handleTextUpdate"
                                    />
                                </div>
                                <div class="attr-row">
                                    <label class="attr-row__label">字号</label>
                                    <n-input-number
                                        class="attr-row__control attr-row__control--narrow"
                                        size="small"
                                        v-model:value="fontSize"
                                        :min="8"
                                        :max="200"
                                        :on-update:value="handleFontSizeChange"
                                    />
                                </div>
                                <div class="attr-row attr-row--top">
                                    <label class="attr-row__label">样式</label>
                                    <div class="attr-segment">
                                        <button
                                            v-for="item in fontStyleList"
                                            :key="item.value"
                                            type="button"
                                            class="attr-segment__btn"
                                            :class="{ 'is-active': fontStyles.includes(item.value) }"
                                            :title="item.label"
                                            @click="handleFontStyleIcon(item.value)"
                                        >
                                            <n-icon :size="16">
                                                <component :is="item.icon" />
                                            </n-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 箭头 -->
                        <section v-if="selectedActive.tag === 'Arrow'" class="attr-section">
                            <h4 class="attr-section__title">箭头</h4>
                            <div class="attr-section__body">
                                <div class="attr-row">
                                    <label class="attr-row__label">头尾同步</label>
                                    <n-switch v-model:value="isArrowBothEnds" size="small">
                                        <template #checked>开</template>
                                        <template #unchecked>关</template>
                                    </n-switch>
                                </div>
                                <div class="attr-row attr-row--top">
                                    <label class="attr-row__label">类型</label>
                                    <div class="attr-arrow-grid">
                                        <button
                                            v-for="item in arrowTypes"
                                            :key="item.key"
                                            type="button"
                                            class="attr-arrow-grid__item"
                                            :title="item.label"
                                            @click="handleArrowTypeClick(item.key)"
                                        >
                                            <img :src="item.icon" :alt="item.label" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 填充 -->
                        <section
                            v-if="showFillSection"
                            class="attr-section"
                        >
                            <h4 class="attr-section__title">填充</h4>
                            <div class="attr-section__body">
                                <div class="attr-swatches">
                                    <button
                                        v-for="(item, index) in colorPanel"
                                        :key="index + item"
                                        type="button"
                                        class="attr-swatches__item"
                                        :style="{ background: item }"
                                        :title="item"
                                        @click="handleFillColor(item)"
                                    />
                                </div>
                                <n-color-picker
                                    class="attr-color-picker"
                                    size="small"
                                    v-model:value="fillColor"
                                    :swatches="colorPanel"
                                    @update:value="handleFillColor"
                                />
                            </div>
                        </section>

                        <!-- 内边距 -->
                        <section
                            v-if="['Box', 'Text'].includes(selectedActive.tag as string)"
                            class="attr-section"
                        >
                            <h4 class="attr-section__title">间距</h4>
                            <div class="attr-section__body">
                                <div class="attr-row">
                                    <label class="attr-row__label">上下</label>
                                    <n-input-number
                                        class="attr-row__control"
                                        size="small"
                                        v-model:value="padding[0]"
                                        clearable
                                        :on-update:value="(val: number | null) => handlePaddingChange(val, 0)"
                                    />
                                </div>
                                <div class="attr-row">
                                    <label class="attr-row__label">左右</label>
                                    <n-input-number
                                        class="attr-row__control"
                                        size="small"
                                        v-model:value="padding[1]"
                                        clearable
                                        :on-update:value="(val: number | null) => handlePaddingChange(val, 1)"
                                    />
                                </div>
                            </div>
                        </section>

                        <!-- 描边 -->
                        <section class="attr-section">
                            <h4 class="attr-section__title">描边</h4>
                            <div class="attr-section__body">
                                <div class="attr-row attr-row--top">
                                    <label class="attr-row__label">颜色</label>
                                    <div class="attr-stroke-picker">
                                        <button
                                            v-for="(item, index) in strokeColorList"
                                            :key="index + item"
                                            type="button"
                                            class="attr-swatches__item"
                                            :style="{ background: item }"
                                            @click="handleStrokeColor(item)"
                                        />
                                        <n-color-picker
                                            class="attr-color-picker attr-color-picker--inline"
                                            size="small"
                                            v-model:value="strokeColor"
                                            :swatches="colorPanel"
                                            @update:value="handleStrokeColor"
                                        />
                                    </div>
                                </div>
                                <div class="attr-row">
                                    <label class="attr-row__label">宽度</label>
                                    <n-input-number
                                        class="attr-row__control attr-row__control--narrow"
                                        size="small"
                                        v-model:value="strokeWidth"
                                        :min="0"
                                        clearable
                                        :on-update:value="handleStrokeWidthChange"
                                    />
                                </div>
                                <div class="attr-row">
                                    <label class="attr-row__label">虚线</label>
                                    <div class="attr-inline-fields">
                                        <n-input-number
                                            size="small"
                                            v-model:value="dashPattern[0]"
                                            placeholder="段长"
                                            :on-update:value="handleDashPatternChange0"
                                        />
                                        <span class="attr-inline-fields__sep">/</span>
                                        <n-input-number
                                            size="small"
                                            v-model:value="dashPattern[1]"
                                            placeholder="间隔"
                                            :on-update:value="handleDashPatternChange1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 布局 -->
                        <section class="attr-section">
                            <h4 class="attr-section__title">布局</h4>
                            <div class="attr-section__body">
                                <div class="attr-row">
                                    <label class="attr-row__label">层级</label>
                                    <n-input-number
                                        class="attr-row__control attr-row__control--narrow"
                                        size="small"
                                        v-model:value="zIndex"
                                        clearable
                                        :on-update:value="handleZIndexChange"
                                    />
                                </div>
                            </div>
                        </section>
                        </div>

                        <footer
                            v-if="selectedActive.id"
                            class="attr-panel__footer"
                        >
                            <button
                                type="button"
                                class="attr-delete-btn"
                                @click="handleAction('del')"
                            >
                                <n-icon :size="16"><DeleteIcon /></n-icon>
                                <span>删除元素</span>
                            </button>
                        </footer>
                    </div>
                </n-tab-pane>

                <n-tab-pane name="layer" tab="图层">
                    <div class="attr-panel__scroll">
                        <section class="attr-section">
                            <h4 class="attr-section__title">画布元素</h4>
                            <ul class="attr-layer-list">
                                <li
                                    v-for="item in editor.app.tree.children"
                                    :key="item.id"
                                    class="attr-layer-list__item"
                                    :class="{ 'is-active': item.id === selectedActive.id }"
                                >
                                    <span class="attr-layer-list__tag">{{ item.tag }}</span>
                                    <span class="attr-layer-list__z">z{{ item.zIndex ?? 0 }}</span>
                                </li>
                                <li
                                    v-if="!editor.app.tree.children?.length"
                                    class="attr-layer-list__empty"
                                >
                                    暂无元素
                                </li>
                            </ul>
                        </section>
                    </div>
                </n-tab-pane>
            </n-tabs>
        </aside>
    </transition>
</template>

<script setup lang="ts">
defineOptions({ name: "ElementAttributes" });

import { Arrow } from "@leafer-in/arrow";
import type { IUI } from "leafer-ui";
import { DeleteIcon } from "@/assets/icons";
import {
    arrowTypes,
    colorPanel,
    fontStyleList,
    strokeColorList,
} from "@/config/attribute-panel";
import useSelectorListen from "@/hooks/useSelectorListen";

const { isSingle, selectedActive, proxyData, editor } = useSelectorListen();

const activeName = ref("setting");
const isArrowBothEnds = ref(false);
const fillColor = ref("#818cf8");
const strokeColor = ref("#2080F0");
const strokeWidth = ref(0);
const dashPattern = ref([0, 0]);
const padding = ref<[number, number]>([0, 0]);
const zIndex = ref(0);
const fontSize = ref(12);
const fontStyles = ref<string[]>([]);
const textContent = ref("");

const elementTagLabel = computed(() => {
    return selectedActive.value?.name ?? "元素";
});

const shortId = computed(() => {
    const id = selectedActive.value?.id ?? "";
    return id.length > 8 ? `${id.slice(0, 8)}…` : id;
});

const showFillSection = computed(() => {
    const tag = selectedActive.value?.tag as string;
    return ["Box", "Rect", "Text", "Group", "Ellipse", "Polygon"].includes(tag);
});

const setProxy = (key: string, value: unknown) => {
    if (proxyData.value) {
        proxyData.value[key] = value;
        return;
    }
    const target = selectedActive.value;
    if (target) (target as any)[key] = value;
};

const handleAction = (type: string = "del") => {
    if (type === "del") editor.deleteNode?.();
};

const handleClick = (val: string) => {
    activeName.value = val;
};

const handleArrowTypeClick = (type: string) => {
    const target = selectedActive.value;
    if (!(target instanceof Arrow)) return;
    if (isArrowBothEnds.value) target.startArrow = type;
    target.endArrow = type;
};

const handleTextUpdate = (value: string) => {
    textContent.value = value;
    setProxy("text", value);
};

const handleFontSizeChange = (value: number | null) => {
    fontSize.value = value || 0;
    setProxy("fontSize", value || 0);
};

const syncFontStylesFromTarget = (target: IUI) => {
    const el = target as any;
    const styles: string[] = [];
    if (el.fontWeight === "bold") styles.push("bold");
    if (el.italic) styles.push("italic");
    if (el.textDecoration === "under") styles.push("under");
    fontStyles.value = styles;
};

const handleFontStyleIcon = (value: string) => {
    const target = selectedActive.value as IUI | null;
    if (!target) return;

    const findVal = fontStyles.value.findIndex((item) => item === value);
    if (findVal > -1) {
        fontStyles.value.splice(findVal, 1);
        if (value === "bold") setProxy("fontWeight", "normal");
        else if (value === "italic") setProxy("italic", false);
        else if (value === "under") setProxy("textDecoration", "none");
    } else {
        fontStyles.value.push(value);
        if (value === "bold") setProxy("fontWeight", "bold");
        else if (value === "italic") setProxy("italic", true);
        else if (value === "under") setProxy("textDecoration", "under");
    }
};

const handleZIndexChange = (value: number | null) => {
    zIndex.value = value || 0;
    setProxy("zIndex", value || 0);
};

const handlePaddingChange = (value: number | null, type: number) => {
    padding.value[type] = value || 0;
    const target = selectedActive.value as IUI | null;
    if (!target) return;

    if (target.tag === "Box" && target.children?.[0]) {
        target.children[0].padding = [...padding.value];
        return;
    }

    setProxy("padding", [...padding.value]);
};

const handleDashPatternChange0 = (value: number | null) => {
    dashPattern.value[0] = value || 0;
    setProxy("dashPattern", [...dashPattern.value]);
};

const handleDashPatternChange1 = (value: number | null) => {
    dashPattern.value[1] = value || 0;
    setProxy("dashPattern", [...dashPattern.value]);
};

const handleStrokeColor = (color: string | null) => {
    if (!color) return;
    strokeColor.value = color;
    setProxy("stroke", color);
};

const handleStrokeWidthChange = (value: number | null) => {
    strokeWidth.value = value || 0;
    setProxy("strokeWidth", value || 0);
};

const handleFillColor = (color: string | null) => {
    if (!color) return;
    fillColor.value = color;
    const target = selectedActive.value as IUI | null;
    if (!target) return;

    if (target.tag === "Group" && target.children?.[0]) {
        target.children[0].fill = color;
        return;
    }

    setProxy("fill", color);
};

watchEffect(() => {
    const pd = proxyData.value;
    const target = selectedActive.value as IUI | null;
    if (!pd || !target) return;

    textContent.value = String(pd.text ?? "");
    fontSize.value = Number(pd.fontSize) || 12;
    fillColor.value = String(pd.fill ?? "");
    strokeColor.value = String(pd.stroke ?? "");
    strokeWidth.value = Number(pd.strokeWidth) || 0;
    dashPattern.value = (pd.dashPattern as number[]) || [0, 0];
    zIndex.value = Number(pd.zIndex) || 0;
    syncFontStylesFromTarget(target);

    if (target.tag === "Box" && target.children?.[0]) {
        padding.value = (target.children[0].padding as [number, number]) || [0, 0];
    } else if (Array.isArray(pd.padding)) {
        padding.value = pd.padding as [number, number];
    }
});
</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-light: #818cf8;
$primary-soft: rgba(99, 102, 241, 0.1);
$border: rgba(15, 23, 42, 0.08);
$text: #1e293b;
$text-muted: #64748b;
$bg: #f8fafc;
$panel-bg: #ffffff;

.fade-attr-enter-active,
.fade-attr-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.fade-attr-enter-from,
.fade-attr-leave-to {
    opacity: 0;
    transform: translateX(12px);
}

.attr-panel {
    --attr-primary: #{$primary};
    --attr-border: #{$border};

    position: absolute;
    inset: 0 0 0 auto;
    width: 300px;
    display: flex;
    flex-direction: column;
    background: $panel-bg;
    border-left: 1px solid var(--attr-border);
    box-shadow: -4px 0 24px rgba(15, 23, 42, 0.06);
    z-index: 2;
    font-size: 12px;
    color: $text;

    &__header {
        flex-shrink: 0;
        padding: 14px 14px 10px;
        border-bottom: 1px solid var(--attr-border);
        background: linear-gradient(180deg, #fff 0%, #{$bg} 100%);
    }

    &__meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    &__badge {
        display: inline-flex;
        align-items: center;
        height: 20px;
        padding: 0 8px;
        border-radius: 999px;
        background: $primary-soft;
        color: $primary;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    &__id {
        font-size: 11px;
        color: $text-muted;
        font-family: ui-monospace, monospace;
    }

    &__title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: $text;
        letter-spacing: -0.01em;
    }

    &__tabs {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 10px 10px 0;

        :deep(.n-tabs-nav) {
            padding: 0 2px;
        }

        :deep(.n-tabs-rail) {
            background: $bg;
            border-radius: 8px;
            padding: 2px;
        }

        :deep(.n-tabs-tab) {
            border-radius: 6px !important;
            font-size: 12px;
        }

        :deep(.n-tabs-tab--active) {
            background: #fff !important;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
            color: $primary !important;
            font-weight: 600;
        }

        :deep(.n-tabs-pane-wrapper) {
            flex: 1;
            min-height: 0;
        }

        :deep(.n-tab-pane) {
            height: 100%;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
    }

    &__pane {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    &__scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 10px 8px 12px;
        scrollbar-width: thin;
        scrollbar-color: rgba(100, 116, 139, 0.35) transparent;

        &::-webkit-scrollbar {
            width: 5px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.35);
            border-radius: 999px;
        }
    }

    &__footer {
        flex-shrink: 0;
        padding: 10px 8px 12px;
        border-top: 1px solid var(--attr-border);
        background: linear-gradient(180deg, #{$bg} 0%, #fff 100%);
    }
}

.attr-section {
    margin-bottom: 12px;
    border: 1px solid var(--attr-border);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;

    &__title {
        margin: 0;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        color: $text-muted;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        background: $bg;
        border-bottom: 1px solid var(--attr-border);
    }

    &__body {
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}

.attr-row {
    display: grid;
    grid-template-columns: 56px 1fr;
    align-items: center;
    gap: 10px;

    &--top {
        align-items: flex-start;

        .attr-row__label {
            padding-top: 6px;
        }
    }

    &__label {
        font-size: 12px;
        color: $text-muted;
        line-height: 1.4;
    }

    &__control {
        width: 100%;

        &--narrow {
            max-width: 96px;
            justify-self: start;
        }
    }
}

.attr-segment {
    display: inline-flex;
    padding: 2px;
    border-radius: 8px;
    background: $bg;
    border: 1px solid var(--attr-border);
    gap: 2px;

    &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 28px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: $text-muted;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.9);
            color: $text;
        }

        &.is-active {
            background: #fff;
            color: $primary;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }
    }
}

.attr-swatches {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;

    &__item {
        aspect-ratio: 1;
        min-height: 22px;
        border: 1px solid rgba(15, 23, 42, 0.1);
        border-radius: 6px;
        cursor: pointer;
        padding: 0;
        transition: transform 0.12s ease, box-shadow 0.12s ease;

        &:hover {
            transform: scale(1.08);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
        }
    }
}

.attr-stroke-picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;

    .attr-swatches__item {
        width: 22px;
        height: 22px;
        min-height: 22px;
    }
}

.attr-color-picker {
    width: 100%;

    &--inline {
        width: auto;
        flex: 1;
        min-width: 72px;
    }

    :deep(.n-color-picker-trigger) {
        border-radius: 8px;
    }
}

.attr-inline-fields {
    display: flex;
    align-items: center;
    gap: 6px;

    &__sep {
        color: $text-muted;
        font-size: 11px;
    }

    :deep(.n-input-number) {
        flex: 1;
        min-width: 0;
    }
}

.attr-arrow-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;

    &__item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 4px 6px;
        border: 1px solid var(--attr-border);
        border-radius: 8px;
        background: #fff;
        cursor: pointer;
        transition: border-color 0.12s ease, background 0.12s ease;

        img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        &:hover {
            border-color: $primary-light;
            background: $primary-soft;
        }
    }
}

.attr-delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
    background: rgba(254, 242, 242, 0.6);
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
        background: rgba(254, 226, 226, 0.9);
        border-color: rgba(239, 68, 68, 0.4);
    }
}

.attr-layer-list {
    list-style: none;
    margin: 0;
    padding: 6px;
    max-height: 320px;
    overflow-y: auto;

    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        transition: background 0.12s ease;

        &:hover {
            background: $bg;
        }

        &.is-active {
            background: $primary-soft;

            .attr-layer-list__tag {
                color: $primary;
                font-weight: 600;
            }
        }
    }

    &__tag {
        font-size: 12px;
        color: $text;
    }

    &__z {
        font-size: 11px;
        color: $text-muted;
        font-variant-numeric: tabular-nums;
        font-family: ui-monospace, monospace;
    }

    &__empty {
        padding: 16px 10px;
        text-align: center;
        color: $text-muted;
        font-size: 12px;
    }
}

:deep(.n-input--focus),
:deep(.n-input-number.n-input-number--focus) {
    .n-input__state-border {
        border-color: $primary !important;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12) !important;
    }
}

:deep(.n-switch.n-switch--active .n-switch__rail) {
    background: $primary !important;
}
</style>
