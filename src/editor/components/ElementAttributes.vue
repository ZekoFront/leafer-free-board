<template>
    <transition name="fade">
        <div class="leafer-free-board--element-attributes" v-if="isSingle">
            <span>{{ isSingle }}{{ selectedMode }}</span>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'ElementAttributes' })
import useSelectorListen from '@/hooks/useSelectorListen';

const { selectedMode, isSingle, selectedActive } = useSelectorListen()

watch(() => selectedActive.value, (newVal) => {
    if (newVal) {
        console.log(newVal);
    }
})
</script>