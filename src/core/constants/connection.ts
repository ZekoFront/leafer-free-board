/** 连线标签最小间距（旧版 MIN_LABEL_GAP = 50） */
export const MIN_CONNECTION_LABEL_GAP = 50;

/** 拖拽预览虚线样式 */
export const CONNECTION_PREVIEW_STYLE = {
    stroke: "#555",
    strokeWidth: 2,
    dashPattern: [4, 4] as number[],
    opacity: 0.85,
    hittable: false,
    editable: false,
    draggable: false,
};

/** 正式连线样式（复用 DEFAULT_ELEMENT_OPTIONS） */
export const CONNECTION_LINE_STYLE = {
    strokeWidth: 1,
    editable: true,
    draggable: false,
    endArrow: "arrow" as const,
};