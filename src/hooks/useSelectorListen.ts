import type EditorBoard from "@/editor/EditorBoard";
import { SelectMode, SelectEvent } from "@/utils";
import type { IUI } from "leafer-editor";

export interface Selector {
    selectedMode: (typeof SelectMode)[keyof typeof SelectMode];
    selectedId: string | undefined;
    selectedIds: (string | undefined)[];
    seletcedType: string;
    selectedActive: IUI | undefined;
    editorBoard: EditorBoard;
}

export default function useSelectorListen() {
    // 注入editorBoard并校验存在性
    const editorBoard = inject('editorBoard') as EditorBoard;
    if (!editorBoard) {
        throw new Error('useSelectorListen 依赖 "editorBoard"，请通过 provide 注入');
    }

    const state = reactive<Selector>({
        selectedMode: SelectMode.EMPTY,
        selectedId: '',
        selectedIds: [],
        selectedActive: undefined,
        seletcedType: '',
        editorBoard: editorBoard,
    });

    const selectSingle = (value: IUI) => {
        state.selectedMode = SelectMode.SINGLE;
        state.selectedId = value.id;
        state.selectedIds = [value.id];
        state.selectedActive = value;
        state.seletcedType = value.tag;
    }

    const selectMultiple = (value: IUI[]) => {
        const target = value
        state.selectedMode = SelectMode.MULTIPLE;
        state.selectedId = '';
        state.selectedIds = target.map((item: IUI) => item.id);
        state.seletcedType = '';
    }

    const selectEmpty = () => {
        state.selectedMode = SelectMode.EMPTY;
        state.selectedId = '';
        state.selectedIds = [];
        state.selectedActive = undefined;
        state.seletcedType = '';
    }

    const isSingle = computed(() => state.selectedMode === SelectMode.SINGLE);
    const isMultiple = computed(() => state.selectedMode === SelectMode.MULTIPLE);
    const selectedModes = computed(() => state.selectedMode);

    onMounted(() => {
        editorBoard.on(SelectEvent.SINGLE, selectSingle);
        editorBoard.on(SelectEvent.MULTIPLE, selectMultiple);
        editorBoard.on(SelectEvent.EMPTY, selectEmpty);
    });

    onBeforeMount(() => {
        editorBoard.off(SelectEvent.SINGLE, selectSingle);
        editorBoard.off(SelectEvent.MULTIPLE, selectMultiple);
        editorBoard.off(SelectEvent.EMPTY, selectEmpty);
    });

    return {
        editorBoard,
        isSingle,
        isMultiple,
        selectedMode: selectedModes,
    }
}