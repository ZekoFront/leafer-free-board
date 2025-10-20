import EditorBoard from "./EditorBoard"
import HistoryPlugin from "./plugins/HistoryPlugin"
import SnapPlugin from "./plugins/SnapPlugin"
import RulerPlugin from "./plugins/RulerPlugin"
import ScrollBarPlugin from "./plugins/ScrollBarPlugin"

export function createEditorBoard(view: HTMLDivElement) {
    const editorBoard = new EditorBoard(view)
    // 获取编辑器实例
    const editor = editorBoard.app.editor
    // 清空画布中的所有元素
    // editor.app.tree.clear()
    // 清空选择
    // editor.app.editor.target = undefined
    // 更新编辑器
    // app.editor.update()
    // 添加 sky 层
    editorBoard.app.sky.add(editor)
    // 内置插件注入
    editorBoard.use(HistoryPlugin)
    editorBoard.use(SnapPlugin)
    editorBoard.use(RulerPlugin)
    editorBoard.use(ScrollBarPlugin)

    console.log('editorBoard:', editorBoard)
    return editorBoard
}