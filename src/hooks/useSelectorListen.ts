import type EditorBoard from "@/editor/EditorBoard";
import { SelectMode, SelectEvent } from "@/utils";
import type { EditorEvent, IUI } from "leafer-editor";

export interface Selector {
    selectedMode: (typeof SelectMode)[keyof typeof SelectMode];
    selectedId: string | undefined;
    selectedIds: (string | undefined)[];
    seletcedType: string;
    selectedActive: unknown;
}

export default function useSelectorListen(editorBoard: EditorBoard) {
    const state = reactive<Selector>({
        selectedMode: SelectMode.EMPTY,
        selectedId: '',
        selectedIds: [],
        selectedActive: undefined,
        seletcedType: '',
    });

    const selectSingle = (evt: EditorEvent) => {
        const target = evt.value as IUI
        state.selectedMode = SelectMode.SINGLE;
        state.selectedId = target.id;
        state.selectedIds = [target.id];
        state.selectedActive = target;
        state.seletcedType = target.tag;
    }

    const selectMultiple = (evt: EditorEvent) => {
        const target = evt.value as IUI[]
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

    onMounted(() => {
        console.log(editorBoard, 9999)
        // editorBoard.on(SelectEvent.SINGLE, selectSingle);
        // editorBoard.on(SelectEvent.MULTIPLE, selectMultiple);
        // editorBoard.on(SelectEvent.EMPTY, selectEmpty);
    });

    // onBeforeMount(() => {
    //     editorBoard.off(SelectEvent.SINGLE, selectSingle);
    //     editorBoard.off(SelectEvent.MULTIPLE, selectMultiple);
    //     editorBoard.off(SelectEvent.EMPTY, selectEmpty);
    // });

    return state;
}