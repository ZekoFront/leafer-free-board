import { UndoManager } from "@/utils/UndoManager";
import { v4 as uuidv4 } from 'uuid'

// 测试字符串数据成功的
const undoManager = new UndoManager();

const historyRecords: Record<string, string> = {};
 
function addHistory(key: string, value: string) {
  historyRecords[key] = value;
}
 
function removeHistory(key: string) {
  delete historyRecords[key];
}
 
function createHistory(key: string, value: string) {
  addHistory(key, value);
  undoManager.add({
    groupId: key,
    undo: () => removeHistory(key),
    redo: () => addHistory(key, value)
  });
}
 
// 测试普通字符串数据
createHistory(uuidv4(), "张三");
createHistory(uuidv4(), "李四");


function Undo() {
    undoManager.undo();
    console.log("撤销操作后:", historyRecords);
}

// 重做操作
function Redo() {
  undoManager.redo();
  console.log("重做操作后:", historyRecords);
}
