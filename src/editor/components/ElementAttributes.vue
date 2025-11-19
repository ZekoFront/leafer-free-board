<template>
    <transition name="fade-attr">
        <div class="leafer-free-board--element-attributes" v-if="isSingle&&selectedActive">
           <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="设置" name="setting">
                    <div class="attribute-item arrow-type" v-if="selectedActive.tag === 'Arrow'">
                        <div class="attribute-item__label">头尾同步
                            <el-switch
                            v-model="isArrowBothEnds"
                            class="ml-2"
                            inline-prompt
                            active-text="是"
                            inactive-text="否"
                            style="margin-left: 1rem;"
                            />
                        </div>
                        <div class="attribute-item__label">箭头类型</div>
                        <div class="attribute-item__options">
                            <img class="arrow-item__icon" v-for="item in arrowTypes" :key="item.key" @click="handleArrowTypeClick(item.key)" :src="item.icon" alt="" :title="item.label">
                        </div>
                    </div>
                    <div class="attribute-item arrow-type">
                        <div class="attribute-item__label">填充颜色</div>
                        <el-color-picker-panel
                            class="attribute-item__picker"
                            v-model="fillColor"
                            :border="false"
                            show-alpha
                            :predefine="predefineColors"
                        />
                    </div>
                </el-tab-pane>
                <el-tab-pane label="图层" name="layer">图层</el-tab-pane>
            </el-tabs>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'ElementAttributes' })
import { Arrow  } from "@leafer-in/arrow";
import { arrowTypes } from '@/editor/utils';
import useSelectorListen from '@/hooks/useSelectorListen';

const { selectedMode, isSingle, selectedActive } = useSelectorListen()

const activeName = ref('setting');
const isArrowBothEnds = ref(false);
const fillColor = ref('#32cd79');
const predefineColors = [
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    '#32cd79',
    '#cccccc',
    '#000000',
    '#808080',
    '#404040',
    '#abcdef',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577',
]

const handleClick = (tab: any) => {
    activeName.value = tab.name;
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