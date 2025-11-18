<template>
    <transition name="fade-attr">
        <div class="leafer-free-board--element-attributes" v-if="isSingle">
           <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="设置" name="setting">
                    <div class="attribute-item">
                        <span class="attribute-item__label">类型</span>
                        <ul class="attribute-item__options">
                            <li class="arrow-item" v-for="item in arrowTypes" :key="item.key" @click="handleArrowTypeClick(item.key)">
                                <img :src="item.icon" alt="" class="arrow-icon">
                                <span>{{ item.label }}</span>
                            </li>
                        </ul>
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

const handleClick = (tab: any) => {
    activeName.value = tab.name;
}

const handleArrowTypeClick = (type: string) => {
    console.log(type);
    if (selectedActive.value instanceof Arrow) {
        selectedActive.value.startArrow = type;
        selectedActive.value.endArrow = type;
    }
}

watch(() => selectedActive.value, (newVal) => {
    if (newVal) {
        console.log(newVal);
    }
})
</script>