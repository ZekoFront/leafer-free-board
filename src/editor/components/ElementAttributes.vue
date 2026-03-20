<template>
    <transition name="fade-attr">
        <div
            class="leafer-free-board--element-attributes"
            v-if="isSingle && selectedActive"
        >
            <n-tabs
                tab-class="tab-class"
                type="line"
                animated
                :on-update:value="handleClick"
            >
                <n-tab-pane name="setting" tab="设置">
                    <template v-if="selectedActive.tag === 'Text'">
                        <div class="attribute-item">
                            <div class="attribute-item__label">字体样式</div>
                            <aside class="attribute-item__flex">
                                <div
                                    class="attribute-item__label"
                                    style="font-weight: normal"
                                >
                                    大小&nbsp;
                                </div>
                                <n-input-number
                                    class="attribute-item__input"
                                    v-model:value="fontSize"
                                    :on-update:value="handleFontSizeChange"
                                />
                            </aside>
                            <div class="attribute-item__font-style">
                                <n-icon
                                    :class="[
                                        'item__icon cursor',
                                        { active: fontStyles.includes(item.value) },
                                    ]"
                                    :size="22"
                                    v-for="item in fontStyleList"
                                    :key="item.value"
                                    :title="item.label"
                                    @click="handleFontStyleIcon(item.value)"
                                >
                                    <component :is="item.icon"></component>
                                </n-icon>
                            </div>
                        </div>
                        <div class="attribute-item">
                            <div class="attribute-item__label">文本内容</div>
                            <n-input
                                class="attribute-item__input"
                                v-model:value="textContent"
                                clearable
                                :placeholder="selectedActive.placeholder || ''"
                                :on-blur="handleTextChange"
                                :on-update:value="handleTextUpdate"
                            />
                        </div>
                    </template>
                    <div
                        class="attribute-item arrow-type"
                        v-if="selectedActive.tag === 'Arrow'"
                    >
                        <div class="attribute-item__label">
                            头尾同步
                            <n-switch v-model:value="isArrowBothEnds">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </n-switch>
                        </div>
                        <div class="attribute-item__label">箭头类型</div>
                        <div class="attribute-item__options">
                            <img
                                class="arrow-item__icon"
                                v-for="item in arrowTypes"
                                :key="item.key"
                                @click="handleArrowTypeClick(item.key)"
                                :src="item.icon"
                                alt=""
                                :title="item.label"
                            />
                        </div>
                    </div>
                    <div
                        class="attribute-item arrow-type"
                        v-if="
                            ['Box', 'Rect', 'Text', 'Group'].includes(
                                selectedActive.tag as string,
                            )
                        "
                    >
                        <div class="attribute-item__label">填充颜色</div>
                        <aside class="attribute-item__color-picker-swatches">
                            <span
                                class="cursor"
                                v-for="(item, index) in colorPanel"
                                :key="index + item"
                                :style="{ background: item }"
                                @click="handleFillColor(item)"
                            ></span>
                        </aside>
                        <n-color-picker
                            v-model:value="fillColor"
                            :swatches="colorPanel"
                        />
                    </div>
                    <div
                        class="attribute-item"
                        v-if="
                            ['Box', 'Text'].includes(
                                selectedActive.tag as string,
                            )
                        "
                    >
                        <div class="attribute-item__label">内边距</div>
                        <div class="attribute-item__flex">
                            <span>上下&nbsp;</span>
                            <n-input-number
                                v-model:value="padding[0]"
                                clearable
                                :on-update:value="
                                    (val) => handlePaddingChange(val, 0)
                                "
                            />
                            <span>&nbsp;左右&nbsp;</span>
                            <n-input-number
                                v-model:value="padding[1]"
                                clearable
                                :on-update:value="
                                    (val) => handlePaddingChange(val, 1)
                                "
                            />
                        </div>
                    </div>
                    <template
                        v-if="
                            ['Line', 'Path'].includes(
                                selectedActive.tag as string,
                            )
                        "
                    >
                        <div class="attribute-item">
                            <div class="attribute-item__label">描边</div>
                            <aside
                                class="attribute-item__flex stroke-color-picker"
                            >
                                <span
                                    class="cursor"
                                    v-for="(item, index) in strokeColorList"
                                    :key="index + item"
                                    :style="{ background: item }"
                                    @click="handleStrokeColor(item)"
                                ></span>
                                <n-color-picker
                                    style="flex: 1"
                                    v-model:value="strokeColor"
                                    :swatches="colorPanel"
                                />
                            </aside>
                        </div>
                        <div class="attribute-item">
                            <div class="attribute-item__label">描边宽度</div>
                            <n-input-number
                                class="attribute-item__input"
                                v-model:value="strokeWidth"
                                clearable
                                :on-update:value="handleStrokeWidthChange"
                            />
                        </div>
                        <div class="attribute-item">
                            <div class="attribute-item__label">描边样式</div>
                            <div class="attribute-item__flex">
                                <span>段长&nbsp;</span>
                                <n-input-number
                                    v-model:value="dashPattern[0]"
                                    clearable
                                    :on-update:value="handleDashPatternChange0"
                                />
                                <span>&nbsp;段间隔&nbsp;</span>
                                <n-input-number
                                    v-model:value="dashPattern[1]"
                                    clearable
                                    :on-update:value="handleDashPatternChange1"
                                />
                            </div>
                        </div>
                    </template>
                    <div class="attribute-item">
                        <div class="attribute-item__label">层级</div>
                        <n-input-number
                            class="attribute-item__input"
                            v-model:value="zIndex"
                            clearable
                            :on-update:value="handleZIndexChange"
                        />
                    </div>
                    <div class="attribute-item" v-if="selectedActive.id">
                        <div class="attribute-item__label">操作</div>
                        <div class="attribute-item__operation">
                            <n-icon title="删除" class="cursor" @click="handleAction('del')"><DeleteIcon/></n-icon>
                            <n-icon title="复制" class="cursor" @click="handleAction('copy')"><CopyIcon/></n-icon>
                        </div>
                    </div>
                </n-tab-pane>
                <n-tab-pane name="layer" tab="图层">
                    <div class="attribute-item">
                        <div class="attribute-item__label">层级</div>
                        <div class="attribute-item__zindex">
                            <p
                                class="zindex-item"
                                v-for="item in editor.app.tree.children"
                                :key="item.id"
                            >
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
defineOptions({ name: "ElementAttributes" });
import { Arrow } from "@leafer-in/arrow";
import { EditorBoard } from "@/editor";
import {
    arrowTypes,
    colorPanel,
    strokeColorList,
    fontStyleList,
} from "@/editor/utils";
import useSelectorListen from "@/hooks/useSelectorListen";
import { ExecuteTypeEnum } from "@/editor/types";
import {
    DeleteIcon,
    CopyIcon,
} from "@/assets/icons";

const { editor } = defineProps({
    editor: {
        type: Object as PropType<EditorBoard>,
        default: EditorBoard,
    },
});

const { isSingle, selectedActive, proxyData } = useSelectorListen();

const activeName = ref("setting");
const isArrowBothEnds = ref(false);
const fillColor = ref("#32cd79");
const strokeColor = ref("#2080F0");
const strokeWidth = ref(0);
const dashPattern = ref([0, 0]);
const padding = ref([0, 0]);
const zIndex = ref(0);
const fontSize = ref(12);
const fontWeight = ref("normal");
const fontStyles = ref<string[]>([]);
const textContent = ref("");


const handleAction = (type: string = 'del') => {
    if (type === 'del') {
        editor.deleteNode()
    } else if (type === 'copy') {
        editor.copyNode()
    }
}

const handleClick = (val: string) => {
    activeName.value = val;
};

const handleArrowTypeClick = (type: string) => {
    if (selectedActive.value instanceof Arrow) {
        isArrowBothEnds.value && (selectedActive.value.startArrow = type);
        selectedActive.value.endArrow = type;
    }
};

const handleTextChange = () => {
    if (selectedActive.value) {
        selectedActive.value.text = textContent.value;
    }
};
const handleTextUpdate = (value: string) => {
    if (selectedActive.value) {
        selectedActive.value.text = value;
    }
};

const handleFontSizeChange = (value: number | null) => {
    if (!proxyData.value) return;
    proxyData.value.fontSize = value || 0;
};

const handleFontStyleIcon = (value: string) => {
    const findVal = fontStyles.value.findIndex((item) => item === value);
    if (findVal > -1 && selectedActive.value) {
        fontStyles.value.splice(findVal, 1);
        if (value === "bold") {
            selectedActive.value.fontWeight = "normal";
        } else if (value === "italic") {
            selectedActive.value.italic = false;
        } else if (value === "under") {
            selectedActive.value.textDecoration = "none";
        }
    } else {
        fontStyles.value.push(value);
        if (selectedActive.value) {
            if (value === "bold") {
                selectedActive.value.fontWeight = "bold";
            } else if (value === "italic") {
                selectedActive.value.italic = true;
            } else if (value === "under") {
                selectedActive.value.textDecoration = "under";
            }
        }
    }
};

const handleZIndexChange = (value: number | null) => {
    zIndex.value = value || 0;
    if (selectedActive.value) {
        selectedActive.value.zIndex = value || 0;
    }
};

const handlePaddingChange = (value: number | null, type: number) => {
    padding.value[type] = value || 0;
    if (selectedActive.value && selectedActive.value.tag === "Box") {
        // Box 子元素的 PropertyEvent 不会被 HandlerPlugin 捕获，需手动记录
        setRecord(
            "padding",
            selectedActive.value?.padding || [0, 0],
            padding.value,
        );
        if (selectedActive.value.children && selectedActive.value.children[0]) {
            selectedActive.value.children[0].padding = padding.value;
        }
    } else if (selectedActive.value && selectedActive.value.tag === "Text") {
        selectedActive.value.padding = padding.value;
    }
};

const handleDashPatternChange0 = (value: number | null) => {
    dashPattern.value[0] = value || 0;
    if (selectedActive.value) {
        selectedActive.value.dashPattern = dashPattern.value;
    }
};

const handleDashPatternChange1 = (value: number | null) => {
    dashPattern.value[1] = value || 0;
    if (selectedActive.value) {
        selectedActive.value.dashPattern = dashPattern.value;
    }
};

const handleStrokeColor = (color: string) => {
    if (selectedActive.value) {
        selectedActive.value.stroke = color;
    }
};
const handleStrokeWidthChange = (value: number | null) => {
    strokeWidth.value = value || 0;
    if (selectedActive.value) {
        selectedActive.value.strokeWidth = value || 0;
    }
};

const handleFillColor = (color: string) => {
    if (selectedActive.value?.tag === "Group") {
        // Group 子元素的 PropertyEvent 不会被 HandlerPlugin 捕获，需手动记录
        if (selectedActive.value?.children && selectedActive.value.children[0]) {
            setRecord("fill", selectedActive.value?.children[0].fill || "", color, selectedActive.value?.children[0].id);
            selectedActive.value.children[0].fill = color;
        }
    } else {
        selectedActive.value && (selectedActive.value.fill = color);
    }
};

const setRecord = (key: string, oldValue: any, newValue: any, childId?: string) => {
    editor.history.execute({
        executeType: ExecuteTypeEnum.UpdateAttribute,
        elementId: selectedActive.value?.id || "",
        oldAttrs: { [key]: oldValue || "" },
        newAttrs: { [key]: newValue },
        tag: selectedActive.value?.tag || "",
        childId: childId || "",
    });
};

watchEffect(() => {
    const pd = proxyData.value;
    if (pd) {
        textContent.value = (pd.text as string) || "";
        fontSize.value = Number(pd.fontSize) || 12;
        fillColor.value = (pd.fill as string) || "";
        strokeColor.value = (pd.stroke as string) || "";
        strokeWidth.value = Number(pd.strokeWidth) || 0;
        dashPattern.value = (pd.dashPattern as number[]) || [0, 0];
        zIndex.value = pd.zIndex || 0;
        fontWeight.value = (pd.fontWeight as string) || "normal";
    }
    // 矩形文本元素的 padding 需要从 children 读取
    if (selectedActive.value?.tag === "Box") {
        const child = selectedActive.value.children?.[0];
        if (child) {
            padding.value = (child.padding as number[]) || [0, 0];
        }
    }
});
</script>
