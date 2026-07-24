import type EditorCore from "@/core/EditorCore";
import { SelectMode, SelectEvent } from "@/core/constants/select-events";
import { useEditorCore } from "@/composables/useEditorCore";
import type { IUI } from "leafer-ui";

export interface ElementProxyData {
    clearProxyData?: () => void;
    proxyData?: Record<string, unknown>;
}

export interface Selector {
    selectedMode: (typeof SelectMode)[keyof typeof SelectMode];
    selectedId: string | undefined;
    selectedIds: (string | undefined)[];
    seletcedType: string;
    selectedActive?: IUI | undefined;
    editor: EditorCore;
}

export default function useSelectorListen() {
    const editor = useEditorCore();

    const selectedActive = shallowRef<IUI | null>(null);
    let previousElement: IUI | null = null;
    const state = reactive<Selector>({
        selectedMode: SelectMode.EMPTY,
        selectedId: "",
        selectedIds: [],
        seletcedType: "",
        editor,
    });

    const _clearPrevProxy = () => {
        const prev = previousElement as ElementProxyData | null;
        prev?.clearProxyData?.();
    };

    const selectSingle = (value: IUI) => {
        _clearPrevProxy();
        state.selectedMode = SelectMode.SINGLE;
        state.selectedId = value.id;
        state.selectedIds = [value.id];
        selectedActive.value = value;
        proxyData.value = (value as ElementProxyData).proxyData ?? null;
        previousElement = value;
        state.seletcedType = value.tag;
    };

    const selectMultiple = (value: IUI[]) => {
        _clearPrevProxy();
        previousElement = null;
        state.selectedMode = SelectMode.MULTIPLE;
        state.selectedId = "";
        state.selectedIds = value.map((item: IUI) => item.id);
        state.seletcedType = "";
        selectedActive.value = null;
        proxyData.value = null;
    };

    const selectEmpty = () => {
        _clearPrevProxy();
        previousElement = null;
        state.selectedMode = SelectMode.EMPTY;
        state.selectedId = "";
        state.selectedIds = [];
        selectedActive.value = null;
        proxyData.value = null;
        state.seletcedType = "";
    };

    const isSingle = computed(() => state.selectedMode === SelectMode.SINGLE);
    const isMultiple = computed(
        () => state.selectedMode === SelectMode.MULTIPLE,
    );
    const selectedModes = computed(() => state.selectedMode);
    const proxyData = shallowRef<any>(null);

    onMounted(() => {
        editor.on(SelectEvent.SINGLE, selectSingle as (...args: any[]) => void);
        editor.on(SelectEvent.MULTIPLE, selectMultiple as (...args: any[]) => void);
        editor.on(SelectEvent.EMPTY, selectEmpty as (...args: any[]) => void);
    });

    onBeforeUnmount(() => {
        editor.off(SelectEvent.SINGLE, selectSingle as (...args: any[]) => void);
        editor.off(SelectEvent.MULTIPLE, selectMultiple as (...args: any[]) => void);
        editor.off(SelectEvent.EMPTY, selectEmpty as (...args: any[]) => void);
    });

    return {
        editor,
        editorCore: editor,
        /** 旧版 src/editor 组件兼容，新代码请用 editorCore */
        editorBoard: editor,
        isSingle,
        isMultiple,
        selectedMode: selectedModes,
        selectedActive,
        proxyData,
    };
}
