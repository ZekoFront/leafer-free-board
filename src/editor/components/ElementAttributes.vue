<template>
    <transition name="fade-attr">
        <div class="leafer-free-board--element-attributes" v-if="isSingle&&selectedActive">
            <n-tabs tab-class="tab-class" type="line" animated :on-update:value="handleClick">
                <n-tab-pane name="setting" tab="设置">
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
                    <div class="attribute-item arrow-type">
                        <div class="attribute-item__label">填充颜色</div>
                        <aside class="attribute-item__color-picker-swatches">
                            <span v-for="(item, index) in colorPanel" :key="index+item" :style="{ background: item }"></span>
                        </aside>
                        <n-color-picker
                            v-model:value="fillColor"
                            :swatches="colorPanel"
                        />
                    </div>
                </n-tab-pane>
                <n-tab-pane name="layer" tab="图层">
                    图层
                </n-tab-pane>
            </n-tabs>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'ElementAttributes' })
import { Arrow  } from "@leafer-in/arrow";
import { arrowTypes, colorPanel } from '@/editor/utils';
import useSelectorListen from '@/hooks/useSelectorListen';

const { isSingle, selectedActive } = useSelectorListen()

const activeName = ref('setting');
const isArrowBothEnds = ref(false);
const fillColor = ref('#32cd79');

const handleClick = (val: string) => {
    activeName.value = val;
}

const handleArrowTypeClick = (type: string) => {
    if (selectedActive.value instanceof Arrow) {
        isArrowBothEnds.value && (selectedActive.value.startArrow = type);
        selectedActive.value.endArrow = type;
    }
}

watch(() => fillColor.value, (newVal) => {
    if (newVal) {
        console.log(newVal);
        selectedActive.value && (selectedActive.value.fill = newVal);
    }
})
</script>