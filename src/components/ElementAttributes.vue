<template>
    <transition name="fade-attr">
        <aside class="attr-panel" v-if="hasSelection">
            <header class="attr-panel__header">
                <div class="attr-panel__meta">
                    <span class="attr-panel__badge">{{ elementTagLabel }}</span>
                    <span class="attr-panel__id" v-if="isSingle && selectedActive?.id">
                        #{{ shortId }}
                    </span>
                    <span class="attr-panel__id" v-else-if="isMultiple">
                        已选 {{ selectionCount }} 个
                    </span>
                </div>
                <h3 class="attr-panel__title">属性</h3>
            </header>

            <n-tabs class="attr-panel__tabs" type="segment" size="small" animated :value="activeName"
                :on-update:value="handleClick">
                <n-tab-pane name="setting" tab="设计">
                    <div class="attr-panel__pane">
                        <div class="attr-panel__scroll">
                            <!-- 文本 -->
                            <section v-if="isSingle && selectedActive?.tag === 'Text'" class="attr-section">
                                <h4 class="attr-section__title">文本</h4>
                                <div class="attr-section__body">
                                    <div class="attr-row">
                                        <label class="attr-row__label">内容</label>
                                        <n-input class="attr-row__control" size="small" v-model:value="textContent"
                                            clearable :placeholder="(selectedActive as any)
                                                .placeholder || '输入文本'
                                                " :on-update:value="handleTextUpdate" />
                                    </div>
                                    <div class="attr-row">
                                        <label class="attr-row__label">字号</label>
                                        <n-input-number class="attr-row__control attr-row__control--narrow" size="small"
                                            v-model:value="fontSize" :min="8" :max="200" :on-update:value="handleFontSizeChange
                                                " />
                                    </div>
                                    <div class="attr-row attr-row--top">
                                        <label class="attr-row__label">样式</label>
                                        <div class="attr-segment">
                                            <button v-for="item in fontStyleList" :key="item.value" type="button"
                                                class="attr-segment__btn" :class="{
                                                    'is-active':
                                                        fontStyles.includes(
                                                            item.value,
                                                        ),
                                                }" :title="item.label" @click="
                                                    handleFontStyleIcon(
                                                        item.value,
                                                    )
                                                    ">
                                                <n-icon :size="16">
                                                    <component :is="item.icon" />
                                                </n-icon>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- 箭头 -->
                            <section v-if="isSingle && selectedActive?.tag === 'Arrow'" class="attr-section">
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
                                            <button v-for="item in arrowTypes" :key="item.key" type="button"
                                                class="attr-arrow-grid__item" :title="item.label" @click="
                                                    handleArrowTypeClick(
                                                        item.key,
                                                    )
                                                    ">
                                                <img :src="item.icon" :alt="item.label" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- 填充 -->
                            <section v-if="showFillSection" class="attr-section">
                                <h4 class="attr-section__title">填充</h4>
                                <div class="attr-section__body">
                                    <div class="attr-swatches">
                                        <button v-for="(item, index) in colorPanel" :key="index + item" type="button"
                                            class="attr-swatches__item" :style="{ background: item }" :title="item"
                                            @click="handleFillColor(item)" />
                                    </div>
                                    <n-color-picker class="attr-color-picker" size="small" v-model:value="fillColor"
                                        :swatches="colorPanel" @update:value="handleFillColor" />
                                </div>
                            </section>

                            <!-- 内边距 -->
                            <section v-if="
                                isSingle &&
                                ['Box', 'Text'].includes(
                                    selectedActive?.tag as string,
                                )
                            " class="attr-section">
                                <h4 class="attr-section__title">间距</h4>
                                <div class="attr-section__body">
                                    <div class="attr-row">
                                        <label class="attr-row__label">上下</label>
                                        <n-input-number class="attr-row__control" size="small"
                                            v-model:value="padding[0]" clearable :on-update:value="(val: number | null) =>
                                                handlePaddingChange(val, 0)
                                                " />
                                    </div>
                                    <div class="attr-row">
                                        <label class="attr-row__label">左右</label>
                                        <n-input-number class="attr-row__control" size="small"
                                            v-model:value="padding[1]" clearable :on-update:value="(val: number | null) =>
                                                handlePaddingChange(val, 1)
                                                " />
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
                                            <button v-for="(
item, index
                                                ) in strokeColorList" :key="index + item" type="button"
                                                class="attr-swatches__item" :style="{ background: item }"
                                                @click="handleStrokeColor(item)" />
                                            <n-color-picker class="attr-color-picker attr-color-picker--inline"
                                                size="small" v-model:value="strokeColor" :swatches="colorPanel"
                                                @update:value="
                                                    handleStrokeColor
                                                " />
                                        </div>
                                    </div>
                                    <div class="attr-row">
                                        <label class="attr-row__label">宽度</label>
                                        <n-input-number class="attr-row__control attr-row__control--narrow" size="small"
                                            v-model:value="strokeWidth" :min="0" clearable :on-update:value="handleStrokeWidthChange
                                                " />
                                    </div>
                                    <div class="attr-row">
                                        <label class="attr-row__label">虚线</label>
                                        <div class="attr-inline-fields">
                                            <n-input-number size="small" v-model:value="dashPattern[0]" placeholder="段长"
                                                :on-update:value="handleDashPatternChange0
                                                    " />
                                            <span class="attr-inline-fields__sep">/</span>
                                            <n-input-number size="small" v-model:value="dashPattern[1]" placeholder="间隔"
                                                :on-update:value="handleDashPatternChange1
                                                    " />
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
                                        <n-input-number class="attr-row__control attr-row__control--narrow" size="small"
                                            v-model:value="zIndex" clearable :on-update:value="handleZIndexChange
                                                " />
                                    </div>
                                </div>
                            </section>

                            <section class="attr-section">
                                <h4 class="attr-section__title">操作</h4>
                                <div class="attr-section__body flex">
                                    <n-icon class="attr-section__icon" :size="15" title="删除" @click.stop="handleAction('del')">
                                        <DeleteIcon />
                                    </n-icon>
                                    <n-icon class="attr-section__icon" :size="18" title="复制" @click.stop="handleAction('copy')">
                                        <CopyIcon />
                                    </n-icon>
                                    <n-icon
                                        class="attr-section__icon"
                                        :class="{ 'is-disabled': !canGroup }"
                                        :size="18"
                                        title="编组"
                                        @click.stop="handleAction('grouping')"
                                    >
                                        <GroupingIcon />
                                    </n-icon>
                                    <n-icon
                                        class="attr-section__icon"
                                        :class="{ 'is-disabled': !canUngroup }"
                                        :size="18"
                                        title="解除编组"
                                        @click.stop="handleAction('ungroup')"
                                    >
                                        <SplitGroupingIcon />
                                    </n-icon>
                                </div>
                            </section>
                        </div>
                    </div>
                </n-tab-pane>

                <n-tab-pane name="layer" tab="图层">
                    <div class="attr-panel__scroll">
                        <section class="attr-section">
                            <h4 class="attr-section__title">画布元素</h4>
                            <ul class="attr-layer-list">
                                <li v-for="item in editor.app.tree.children" :key="item.id"
                                    class="attr-layer-list__item" :class="{
                                        'is-active':
                                            isLayerActive(item.id),
                                    }" @click="handleSelect(item)">
                                    <span class="attr-layer-list__tag">{{
                                        item.name ?? item.tag
                                    }}</span>
                                    <span class="attr-layer-list__z">
                                        <n-icon class="cursor" :title="item.visible ? '可见' : '不可见'
                                            " :size="22" @click.stop="handleEye(item)">
                                            <EyeShowIcon v-if="item.visible" />
                                            <EyeHideIcon v-else />
                                        </n-icon></span>
                                </li>
                                <li v-if="!editor.app.tree.children?.length" class="attr-layer-list__empty">
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
import { computed, ref, watchEffect } from "vue";
import { DeleteIcon, EyeShowIcon, EyeHideIcon, CopyIcon, GroupingIcon, SplitGroupingIcon } from "@/assets/icons";
import {
    arrowTypes,
    colorPanel,
    fontStyleList,
    strokeColorList,
} from "@/config/attribute-panel";
import useSelectorListen from "@/hooks/useSelectorListen";

const { isSingle, isMultiple, selectedActive, proxyData, editor, selectedIds } =
    useSelectorListen();

const FILL_TAGS = new Set([
    "Box",
    "Rect",
    "Text",
    "Group",
    "Ellipse",
    "Polygon",
    "Star",
]);

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

/** 当前选中且可编辑的图元（排除连线/标签） */
const getEditableSelection = (): IUI[] => {
    const list = (editor.app.editor.list ?? []) as IUI[];
    return list.filter(
        (node) =>
            node.id &&
            !editor.isConnectionLine?.(node) &&
            !editor.isConnectionLabel?.(node),
    );
};

const selectionCount = computed(() => {
    if (isMultiple.value) {
        return selectedIds.value.filter(Boolean).length;
    }
    return isSingle.value ? 1 : 0;
});

/** 依赖 SelectEvent 驱动的 isSingle/isMultiple，勿直接读 editor.list（非响应式） */
const hasSelection = computed(() => isSingle.value || isMultiple.value);

const canGroup = computed(() => selectionCount.value >= 2);

const canUngroup = computed(() => {
    if (isSingle.value && selectedActive.value?.tag === "Group") {
        return true;
    }
    if (isMultiple.value) {
        const list = getEditableSelection();
        return list.length > 0 && list.every((node) => node.tag === "Group");
    }
    return false;
});

const elementTagLabel = computed(() => {
    if (isMultiple.value) {
        return `多选 · ${selectionCount.value}`;
    }
    return selectedActive.value?.name ?? selectedActive.value?.tag ?? "元素";
});

const shortId = computed(() => {
    const id = selectedActive.value?.id ?? "";
    return id.length > 8 ? `${id.slice(0, 8)}…` : id;
});

const showFillSection = computed(() => {
    if (isSingle.value && selectedActive.value) {
        return FILL_TAGS.has(selectedActive.value.tag as string);
    }
    if (isMultiple.value) {
        return getEditableSelection().some((node) =>
            FILL_TAGS.has(node.tag as string),
        );
    }
    return false;
});

function getCommonAttr(
    list: IUI[],
    getter: (node: IUI) => unknown,
): unknown | undefined {
    if (!list.length) return undefined;
    const first = getter(list[0]!);
    return list.every((node) => getter(node) === first) ? first : undefined;
}

const isLayerActive = (id?: string) => {
    if (!id) return false;
    if (isMultiple.value) {
        return selectedIds.value.includes(id);
    }
    return selectedActive.value?.id === id;
};

/** 批量写入属性（单选走 proxy，多选直接赋值） */
const applyToSelection = (key: string, value: unknown) => {
    const targets = getEditableSelection();
    if (!targets.length) return;

    if (targets.length === 1 && proxyData.value) {
        proxyData.value[key] = value;
        return;
    }

    for (const target of targets) {
        if (key === "fill" && target.tag === "Group" && target.children?.[0]) {
            target.children[0].fill = value as never;
            continue;
        }
        if (
            key === "padding" &&
            target.tag === "Box" &&
            target.children?.[0]
        ) {
            target.children[0].padding = value as never;
            continue;
        }
        (target as unknown as Record<string, unknown>)[key] = value;
    }
};

const setProxy = (key: string, value: unknown) => {
    applyToSelection(key, value);
};

const handleSelect = (item: IUI) => {
    editor.app.editor.select(item);
};

const handleEye = (item: IUI) => {
    item.visible = !item.visible;
    editor.app.editor.cancel();
};

const handleAction = (type: string = "del") => {
    if (type === "del") editor.deleteNode?.();
    if (type === "copy") editor.copyNode?.();
    if (type === "grouping" && canGroup.value) {
        editor.groupSelection?.();
    }
    if (type === "ungroup" && canUngroup.value) {
        editor.ungroupSelection?.();
    }
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
    applyToSelection("fill", color);
};

watchEffect(() => {
    const list = getEditableSelection();
    if (!list.length) return;

    if (isSingle.value && proxyData.value && selectedActive.value) {
        const pd = proxyData.value;
        const target = selectedActive.value;

        textContent.value = String(pd.text ?? "");
        fontSize.value = Number(pd.fontSize) || 12;
        fillColor.value = String(pd.fill ?? "");
        strokeColor.value = String(pd.stroke ?? "");
        strokeWidth.value = Number(pd.strokeWidth) || 0;
        dashPattern.value = (pd.dashPattern as number[]) || [0, 0];
        zIndex.value = Number(pd.zIndex) || 0;
        syncFontStylesFromTarget(target);

        if (target.tag === "Box" && target.children?.[0]) {
            padding.value = (target.children[0].padding as [number, number]) || [
                0, 0,
            ];
        } else if (Array.isArray(pd.padding)) {
            padding.value = pd.padding as [number, number];
        }
        return;
    }

    if (isMultiple.value) {
        const commonFill = getCommonAttr(list, (n) => n.fill);
        if (commonFill !== undefined) {
            fillColor.value = String(commonFill ?? "");
        }

        const commonStroke = getCommonAttr(list, (n) => n.stroke);
        if (commonStroke !== undefined) {
            strokeColor.value = String(commonStroke ?? "");
        }

        const commonStrokeWidth = getCommonAttr(list, (n) => n.strokeWidth);
        if (commonStrokeWidth !== undefined) {
            strokeWidth.value = Number(commonStrokeWidth) || 0;
        }

        const commonDash = getCommonAttr(list, (n) =>
            JSON.stringify(n.dashPattern ?? [0, 0]),
        );
        if (commonDash !== undefined) {
            dashPattern.value = JSON.parse(String(commonDash)) as number[];
        }

        const commonZ = getCommonAttr(list, (n) => n.zIndex);
        if (commonZ !== undefined) {
            zIndex.value = Number(commonZ) || 0;
        }
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
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
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
        padding: 10px 0px 0;

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
        &.flex {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .attr-section__icon {
            cursor: pointer;
            color: $text-muted;

            &.is-disabled {
                opacity: 0.35;
                cursor: not-allowed;
                pointer-events: none;
            }
        }
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
        transition:
            transform 0.12s ease,
            box-shadow 0.12s ease;

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
        transition:
            border-color 0.12s ease,
            background 0.12s ease;

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
