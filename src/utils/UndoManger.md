### 简单撤销重做工具使用

```js
import { UndoManager } from '@/utils/UndoManager'

// 方法调用
createHistory({ id: uuidv4(), value: app.tree.toString() })

// 实例化撤销管理器
interface IHistory {
    id: string,
    value: string
}
// 最多保留20条最新记录
const MAX_HISTORY_SIZE = 20; 
const undoManager = new UndoManager();
// 设置最大撤销步数。默认值：0（无限制）
undoManager.setLimit(15);
// 测试数组数据
const historyRecords: IHistory[] = [];
 
function addHistory(value: IHistory) {
    historyRecords.push(value);
    forceRender()
}
function removeHistory(id: string) {
    var i = 0, index = -1;
    for (i = 0; i < historyRecords.length; i += 1) {
        const item = historyRecords[i] as IHistory;
        if(item && item.id === id) {
            index = i;
        }
    }
    if (index !== -1) {
        historyRecords.splice(index, 1);
        forceRender()
    }
}
 
function createHistory(value: IHistory) {
    historyRecords.push(value);
    // 若超过最大限制，删除最旧的一条（数组第一条）
    if (historyRecords.length > MAX_HISTORY_SIZE) {
        // 移除最旧的记录（index=0）
        historyRecords.shift();
    }

    undoManager.add({
        undo: () => removeHistory(value.id||""),
        redo: () => addHistory(value)
    });
}

function forceRender() {
    if (historyRecords.length) {
        const lastItem = historyRecords[historyRecords.length - 1]
        if (lastItem) {
            const { value } = lastItem
            if (value) {
                app.tree.set(JSON.parse(value) as IUIInputData)
                // 取消选中元素
                // app.editor.cancel()
                // return
                // 根据id选中元素
                const selectedId = selectedUI.value.id;
                // 查找元素
                const selectedElement = app.tree.children.find(el => el.id ===selectedId);
                if (selectedElement) {
                    // 选择元素
                    app.editor.select(selectedElement)
                }
            }
        }
    }
}

console.log(historyRecords)

// 撤销操作
function undo() {
    const hasUndo = undoManager.hasUndo();
    if (hasUndo) {
        undoManager.undo();
        console.log("撤销操作后:", historyRecords);
    }
}

// 重做操作
function redo() {
    const hasRedo = undoManager.hasRedo();
    if (hasRedo) {
        undoManager.redo();
        console.log("重做操作后:", historyRecords);
    }
}
```