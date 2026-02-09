<template>
    <transition name="fade-attr">
        <div class="leafer-free-board--element-attributes" v-if="isSingle&&selectedActive">
            <n-tabs tab-class="tab-class" type="line" animated :on-update:value="handleClick">
                <n-tab-pane name="setting" tab="设置">
                    <div class="attribute-item" v-if="selectedActive.tag === 'Text'">
                        <div class="attribute-item__label">字体样式</div>
                        <aside class="attribute-item__flex">
                            <div class="attribute-item__label" style="font-weight: normal;">大小&nbsp;</div>
                            <n-input-number class="attribute-item__input" v-model:value="selectedActive.fontSize" :on-update:value="handleFontSizeChange"/>
                        </aside>
                        <div class="attribute-item__font-style">
                            <n-icon :class="['item__icon cursor', { 'active': fontStyles.includes(item.value) }]" :size="22" v-for="item in fontStyleList" :key="item.value" :title="item.label" @click="handleFontStyleIcon(item.value)">
                                <component :is="item.icon"></component>
                            </n-icon>
                        </div>
                    </div>
                    <div class="attribute-item arrow-type" v-if="selectedActive.tag === 'Arrow'">
                        <div class="attribute-item__label">头尾同步
                            <n-switch v-model:value="isArrowBothEnds">
                                <template #checked>
                                是
                                </template>
                                <template #unchecked>
                                否
                                </template>
                            </n-switch>
                        </div>
                        <div class="attribute-item__label">箭头类型</div>
                        <div class="attribute-item__options">
                            <img class="arrow-item__icon" v-for="item in arrowTypes" :key="item.key" @click="handleArrowTypeClick(item.key)" :src="item.icon" alt="" :title="item.label">
                        </div>
                    </div>
                    <div class="attribute-item arrow-type" v-if="['Box','Rect', 'Text'].includes(selectedActive.tag as string)">
                        <div class="attribute-item__label">填充颜色</div>
                        <aside class="attribute-item__color-picker-swatches">
                            <span class="cursor" v-for="(item, index) in colorPanel" :key="index+item" :style="{ background: item }" @click="handleColorClick(item)"></span>
                        </aside>
                        <n-color-picker
                            v-model:value="fillColor"
                            :swatches="colorPanel"
                        />
                    </div>
                    <div class="attribute-item" v-if="['Box'].includes(selectedActive.tag as string)">
                        <div class="attribute-item__label">内边距</div>
                        <div class="attribute-item__flex">
                            <span>上下&nbsp;</span>
                            <n-input-number v-model:value="padding[0]" clearable :on-update:value="(val) => handlePaddingChange(val, 0)"/>
                            <span>&nbsp;左右&nbsp;</span>
                            <n-input-number v-model:value="padding[1]" clearable :on-update:value="(val) => handlePaddingChange(val, 1)"/>
                        </div>
                    </div>
                    <div class="attribute-item">
                        <div class="attribute-item__label">描边</div>
                        <aside class="attribute-item__flex stroke-color-picker">
                            <span class="cursor" v-for="(item, index) in strokeColorList" :key="index+item" :style="{ background: item }" @click="handleStrokeColor(item)"></span>
                            <n-color-picker style="flex: 1;" v-model:value="strokeColor" :swatches="colorPanel" />
                        </aside>
                    </div>
                    <div class="attribute-item">
                        <div class="attribute-item__label">描边宽度</div>
                        <n-input-number class="attribute-item__input" v-model:value="strokeWidth" clearable :on-update:value="handleStrokeWidthChange"/>
                    </div>
                    <div class="attribute-item">
                        <div class="attribute-item__label">描边样式</div>
                        <div class="attribute-item__flex">
                            <span>段长&nbsp;</span>
                            <n-input-number v-model:value="dashPattern[0]" clearable :on-update:value="handleDashPatternChange0"/>
                            <span>&nbsp;段间隔&nbsp;</span>
                            <n-input-number v-model:value="dashPattern[1]" clearable :on-update:value="handleDashPatternChange1"/>
                        </div>
                    </div>
                    <div class="attribute-item">
                        <div class="attribute-item__label">层级</div>
                        <n-input-number class="attribute-item__input" v-model:value="zIndex" clearable :on-update:value="handleZIndexChange"/>
                    </div>
                </n-tab-pane>
                <n-tab-pane name="layer" tab="图层">
                    <div class="attribute-item">
                        <div class="attribute-item__label">层级</div>
                        <div class="attribute-item__zindex">
                            <p class="zindex-item" v-for="item in editor.app.tree.children" :key="item.id">
                                <span class="label">{{ item.tag }}</span>
                                <span class="value">{{ item.zIndex }}</span>
                            </p>
                        </div>
                    </div>
                </n-tab-pane>
            </n-tabs>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'ElementAttributes' })
import { Arrow  } from "@leafer-in/arrow";
import { EditorBoard } from '@/editor'
import { arrowTypes, colorPanel, strokeColorList, fontStyleList } from '@/editor/utils';
import useSelectorListen from '@/hooks/useSelectorListen';
import { ExecuteTypeEnum } from "@/editor/types"

const { editor } = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard
    }
})

const { isSingle, selectedActive } = useSelectorListen()

const activeName = ref('setting');
const isArrowBothEnds = ref(false);
const fillColor = ref('#32cd79');
const strokeColor = ref('#2080F0');
const strokeWidth = ref(0);
const dashPattern = ref([0, 0]);
const padding = ref([0, 0]);
const zIndex = ref(0);
const fontWeight = ref('normal');
const fontStyles = ref<string[]>([]);

const handleClick = (val: string) => {
    activeName.value = val;
}

const handleArrowTypeClick = (type: string) => {
    if (selectedActive.value instanceof Arrow) {
        isArrowBothEnds.value && (selectedActive.value.startArrow = type);
        selectedActive.value.endArrow = type;
    }
}

const handleFontSizeChange = (value: number|null) => {
    if (selectedActive.value) {
        setRecord('fontSize', selectedActive.value?.fontSize || 0, value);
        selectedActive.value.fontSize = value || 0;
    }
}

const handleFontStyleIcon = (value: string) => {
    const findVal = fontStyles.value.findIndex(item => item === value);
    if (findVal > -1 && selectedActive.value) {
        fontStyles.value.splice(findVal, 1);
        if (value === 'bold') {
            selectedActive.value.fontWeight = 'normal'
        } else if (value === 'italic') {
            selectedActive.value.italic = false
        } else if (value === 'under') {
            selectedActive.value.textDecoration = 'none'
        }
    } else {
        fontStyles.value.push(value);
        if (selectedActive.value) {
            if (value === 'bold') {
                selectedActive.value.fontWeight = 'bold'
            } else if (value === 'italic') {
                selectedActive.value.italic = true
            } else if (value === 'under') {
                selectedActive.value.textDecoration = 'under'
            }
        }
    }
}

const handleZIndexChange = (value: number|null) => {
    zIndex.value = value || 0;
    if (selectedActive.value) {
        setRecord('zIndex', selectedActive.value?.zIndex || 0, value);
        selectedActive.value.zIndex = value || 0;
    }
}

const handlePaddingChange = (value: number|null, type: number) => {
    padding.value[type] = value || 0;
    if (selectedActive.value && selectedActive.value.tag === 'Box') {
        setRecord('padding', selectedActive.value?.padding || [0, 0], padding.value);
        if (selectedActive.value.children && selectedActive.value.children[0]) {
            selectedActive.value.children[0].padding = padding.value;
        }
    }
}

const handleDashPatternChange0 = (value: number|null) => {
    dashPattern.value[0] = value || 0;
    if (selectedActive.value) {
        setRecord('dashPattern', selectedActive.value?.dashPattern || [0, 0], dashPattern.value);
        selectedActive.value.dashPattern = dashPattern.value;
    }
}

const handleDashPatternChange1 = (value: number|null) => {
    dashPattern.value[1] = value || 0;
    if (selectedActive.value) {
        setRecord('dashPattern', selectedActive.value?.dashPattern || [0, 0], dashPattern.value);
        selectedActive.value.dashPattern = dashPattern.value;
    }
}

const handleStrokeColor = (color: string) => {
    if (selectedActive.value) {
        setRecord('stroke', selectedActive.value?.stroke || '', color);
        selectedActive.value.stroke = color;
    }
}
const handleStrokeWidthChange = (value: number|null) => {
    strokeWidth.value = value || 0;
    if (selectedActive.value) {
        setRecord('strokeWidth', selectedActive.value?.strokeWidth || 0, value);
        selectedActive.value.strokeWidth = value || 0;
    }
}

const handleColorClick = (color: string) => {
    setRecord('fill', selectedActive.value?.fill || '', color);
    selectedActive.value && (selectedActive.value.fill = color);
}

const setRecord = (key: string, oldValue: any, newValue: any) => {
    // 保留历史记录
    editor.history.execute({
        elementId: selectedActive.value?.id || '',
        oldAttrs: { [key]: oldValue || '' },
        newAttrs: { [key]: newValue },
        tag: selectedActive.value?.tag || '',
        data: {
            executeType: ExecuteTypeEnum.UpdateAttribute
        }
    })
}

watchEffect(() => {
    if (selectedActive.value) {
        fillColor.value = selectedActive.value.fill as string || '';
        strokeColor.value = selectedActive.value.stroke as string || '';
        strokeWidth.value = Number(selectedActive.value.strokeWidth) || 0;
        dashPattern.value = selectedActive.value.dashPattern as number[] || [0, 0];
        zIndex.value = selectedActive.value.zIndex || 0;
        fontWeight.value = selectedActive.value.fontWeight as string || 'normal';
        // 矩形文本元素生效
        if (selectedActive.value.tag === 'Box') {
            if (selectedActive.value.children && selectedActive.value.children[0]) {
                padding.value = selectedActive.value.children[0].padding as number[] || [0, 0];
            }
        }
    }
})
</script>