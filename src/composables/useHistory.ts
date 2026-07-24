import { computed, onMounted, onUnmounted, ref } from "vue";
import { CustomEvent } from "@/core/constants";
import { useEditorCore } from "@/composables/useEditorCore";

export interface HistoryState {
    canUndo: boolean;
    canRedo: boolean;
}

/**
 * 画布历史记录 composable
 *
 * 依赖 HistoryPlugin 通过 EditorCore.bindApis 暴露的方法：
 * undo / redo / getCanUndo / getCanRedo / clearHistory
 *
 * 栈变化时 HistoryPlugin 会 emit CustomEvent.CHANGE，用于驱动 Vue 按钮 disabled 状态。
 */
export function useHistory() {
    const editor = useEditorCore();
    const canUndo = ref(false);
    const canRedo = ref(false);

    const syncState = (state?: HistoryState) => {
        if (state) {
            canUndo.value = state.canUndo;
            canRedo.value = state.canRedo;
            return;
        }
        canUndo.value = editor.getCanUndo?.() ?? false;
        canRedo.value = editor.getCanRedo?.() ?? false;
    };

    const undo = () => editor.undo?.();
    const redo = () => editor.redo?.();
    const clearHistory = () => editor.clearHistory?.();

    onMounted(() => {
        syncState();
        editor.on(CustomEvent.CHANGE, syncState);
    });

    onUnmounted(() => {
        editor.off(CustomEvent.CHANGE, syncState);
    });

    return {
        canUndo: computed(() => canUndo.value),
        canRedo: computed(() => canRedo.value),
        undo,
        redo,
        clearHistory,
        syncState,
    };
}
