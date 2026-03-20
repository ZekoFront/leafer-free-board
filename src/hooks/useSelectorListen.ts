import type EditorBoard from "@/editor/EditorBoard";
import { SelectMode, SelectEvent } from "@/editor/utils";
import type { IUI, IUIInputData } from "leafer-ui";

export interface Selector {
    selectedMode: (typeof SelectMode)[keyof typeof SelectMode];
    selectedId: string | undefined;
    selectedIds: (string | undefined)[];
    seletcedType: string;
    selectedActive?: IUI | undefined;
    editorBoard: EditorBoard;
}

export default function useSelectorListen() {
    // 注入editorBoard并校验存在性
    const editorBoard = inject("editorBoard") as EditorBoard;
    if (!editorBoard) {
        throw new Error(
            'useSelectorListen 依赖 "editorBoard"，请通过 provide 注入',
        );
    }

    const selectedActive = shallowRef<IUIInputData | null>(null);
    let previousElement: IUIInputData | null = null;
    const state = reactive<Selector>({
        selectedMode: SelectMode.EMPTY,
        selectedId: "",
        selectedIds: [],
        seletcedType: "",
        editorBoard: editorBoard,
    });

    // 切换前清理旧元素的代理数据
    const _clearPrevProxy = () => {
        if (previousElement && (previousElement as any).clearProxyData) {
            (previousElement as any).clearProxyData();
        }
    };

    const selectSingle = (value: IUI) => {
        _clearPrevProxy();
        state.selectedMode = SelectMode.SINGLE;
        state.selectedId = value.id;
        state.selectedIds = [value.id];
        selectedActive.value = value;
        proxyData.value = (value as any).proxyData;
        previousElement = value;
        state.seletcedType = value.tag;
    };

    const selectMultiple = (value: IUI[]) => {
        _clearPrevProxy();
        previousElement = null;
        const target = value;
        state.selectedMode = SelectMode.MULTIPLE;
        state.selectedId = "";
        state.selectedIds = target.map((item: IUI) => item.id);
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
        editorBoard.on(SelectEvent.SINGLE, selectSingle);
        editorBoard.on(SelectEvent.MULTIPLE, selectMultiple);
        editorBoard.on(SelectEvent.EMPTY, selectEmpty);
    });

    onBeforeUnmount(() => {
        editorBoard.off(SelectEvent.SINGLE, selectSingle);
        editorBoard.off(SelectEvent.MULTIPLE, selectMultiple);
        editorBoard.off(SelectEvent.EMPTY, selectEmpty);
    });

    return {
        editorBoard,
        isSingle,
        isMultiple,
        selectedMode: selectedModes,
        selectedActive,
        proxyData
    };
}
