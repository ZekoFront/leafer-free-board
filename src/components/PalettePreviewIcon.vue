<template>
    <svg
        class="palette-preview-icon"
        viewBox="0 0 28 20"
        aria-hidden="true"
    >
        <rect
            v-if="preview === 'rect'"
            v-bind="boxRect"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
        <rect
            v-else-if="preview === 'rounded-rect'"
            v-bind="boxRect"
            rx="3"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
        <ellipse
            v-else-if="preview === 'circle'"
            :cx="CX"
            :cy="CY"
            :rx="6"
            :ry="6"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
        <ellipse
            v-else-if="preview === 'ellipse'"
            :cx="CX"
            :cy="CY"
            :rx="10"
            :ry="6"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
        <polygon
            v-else-if="polygonPoints"
            :points="polygonPoints"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
            stroke-linejoin="miter"
            stroke-miterlimit="4"
        />
        <template v-else-if="preview === 'text'">
            <rect
                v-bind="boxRect"
                fill="none"
                stroke="currentColor"
                :stroke-width="SW"
                stroke-dasharray="3 2"
            />
            <text
                :x="CX"
                y="12.5"
                text-anchor="middle"
                font-size="8"
                font-weight="700"
                fill="currentColor"
            >
                T
            </text>
        </template>
        <rect
            v-else-if="preview === 'mind-topic'"
            v-bind="boxRect"
            rx="4"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
        <rect
            v-else-if="preview === 'mind-sub'"
            x="5"
            y="5"
            width="18"
            height="10"
            rx="3"
            fill="none"
            stroke="currentColor"
            :stroke-width="SW"
        />
    </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/theme";

/** 基础图形外接框：宽 20 × 高 12 */
const SW = 1;
const CX = 14;
const CY = 10;
const boxRect = { x: 4, y: 4, width: 20, height: 12 };

/** 多边形 / 星形放大至 viewBox 可用极限，菱角更清晰 */
const POLYGON_R = 7.8;

const STAR_TIPS: Record<string, number> = {
    star: 5,
    "star-4": 4,
    "star-6": 6,
    "star-7": 7,
    "star-8": 8,
};

/** 角数越多，内凹越小，避免糊成一团 */
function starInnerRatio(tips: number): number {
    if (tips <= 4) return 0.42;
    if (tips <= 5) return 0.38;
    if (tips <= 6) return 0.3;
    return 0.24;
}

function rhombus(r: number): string {
    return `${CX},${(CY - r).toFixed(1)} ${(CX + r).toFixed(1)},${CY} ${CX},${(CY + r).toFixed(1)} ${(CX - r).toFixed(1)},${CY}`;
}

function triangle(r: number): string {
    const halfBase = r * 0.95;
    return `${CX},${(CY - r).toFixed(1)} ${(CX - halfBase).toFixed(1)},${(CY + r * 0.85).toFixed(1)} ${(CX + halfBase).toFixed(1)},${(CY + r * 0.85).toFixed(1)}`;
}

/** 正 N 边形，默认顶点朝上 */
function regularPolygon(sides: number, radius: number, rotationDeg = -90): string {
    const pts: string[] = [];
    const step = (2 * Math.PI) / sides;
    let angle = (rotationDeg * Math.PI) / 180;

    for (let i = 0; i < sides; i++) {
        const x = CX + radius * Math.cos(angle);
        const y = CY + radius * Math.sin(angle);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        angle += step;
    }
    return pts.join(" ");
}

/** 生成 N 角星（交替 outer / inner 半径） */
function starPolygon(tips: number, outerR: number, rotationDeg = -90): string {
    const innerR = outerR * starInnerRatio(tips);
    const pts: string[] = [];
    const total = tips * 2;
    const step = Math.PI / tips;
    let angle = (rotationDeg * Math.PI) / 180;

    for (let i = 0; i < total; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const x = CX + r * Math.cos(angle);
        const y = CY + r * Math.sin(angle);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        angle += step;
    }
    return pts.join(" ");
}

const props = defineProps<{
    preview: string;
}>();

const { elementTheme } = storeToRefs(useThemeStore());

const polygonPoints = computed(() => {
    const tips = STAR_TIPS[props.preview];
    if (tips) {
        return starPolygon(tips, POLYGON_R);
    }

    switch (props.preview) {
        case "diamond":
            return rhombus(POLYGON_R);
        case "triangle":
            return triangle(POLYGON_R);
        case "pentagon":
            return regularPolygon(5, POLYGON_R);
        case "hexagon":
            return regularPolygon(6, POLYGON_R);
        default:
            return undefined;
    }
});

const strokeColor = computed(() => {
    if (props.preview === "mind-sub") {
        return elementTheme.value.mindSub.stroke;
    }
    if (props.preview === "mind-topic") {
        return elementTheme.value.strokeDark;
    }
    return elementTheme.value.stroke;
});
</script>

<style scoped lang="scss">
.palette-preview-icon {
    width: 32px;
    height: 24px;
    display: block;
    flex-shrink: 0;
    color: v-bind("strokeColor");
}
</style>
