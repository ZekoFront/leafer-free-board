import { isEqual } from 'lodash-es'

import type { ICommand } from "./interface/ICommand";
import { ExecuteTypeEnum, type IPluginOption, type IPluginTempl } from '@/editor/types';
import type { IUIInputData } from 'leafer-ui';
import { AddCommand, MoveCommand, UpdateAttrCommand } from './index';
import type EditorBoard from '@/editor/EditorBoard';

// 历史记录管理器 - 核心撤销重做逻辑
export class HistoryManager implements IPluginTempl {
	static pluginName: string = "HistoryManager";
    static events: string[] = [];
    static apis: string[] = [];
	private maxHistorySize: number // 历史记录最大数量
	private undoStack: ICommand[] = [] // 撤销栈
  	private redoStack: ICommand[] = [] // 重做栈
	private currentBatch: ICommand | null = null // 当前批量操作命令
	constructor(public editorBoard: EditorBoard, options: IPluginOption) {
		this.maxHistorySize = Number(options.maxHistorySize) || 50;
		this.undoStack = [];
		this.redoStack = [];
		this.currentBatch = null;
	}

	// 执行命令
	execute(element: IUIInputData) {
		if (!element || !element.data) return
		// 新增元素命令
		if (element.data.executeType === ExecuteTypeEnum.AddElement) {
			element.type = ExecuteTypeEnum.AddElement
			const command = new AddCommand({ element, editorBoard: this.editorBoard, type: ExecuteTypeEnum.AddElement })
			this.addCommand(command)
		} else if (element.data.executeType === ExecuteTypeEnum.MoveElement) {
			// 移动元素命令
			const command = new MoveCommand({
				moveList: element.data.moveList,
				tag: element.tag || "",
				editor: this.editorBoard
			})
			this.addCommand(command)
		} else if (element.data.executeType === ExecuteTypeEnum.UpdateAttribute) {
			// 更新元素属性
			const command = new UpdateAttrCommand({ 
				elementId: element.elementId, 
				editor: this.editorBoard, 
				oldAttrs: element.oldAttrs, 
				newAttrs: element.newAttrs,
				tag: element.tag || "" 
			})
			this.addCommand(command)
		}
	}

	// 通用命令
	private addCommand(command: ICommand) {
		// 单独执行命令
		if (command.isValid && !command.isValid()) return;

		// 存入命令也需要对比是否存在同样的命令，有只存储一个即可，保证命令唯一性
		const isExied = this.undoStack.some(el => {
			return isEqual(el, command)
		})

		// 新命令
		if (!isExied) {
			this.undoStack.push(command);
		}
		
		// 清空重做栈
		this.redoStack = [];

		// 限制历史记录大小
		if (this.undoStack.length > this.maxHistorySize) {
			this.undoStack.shift();
		}

		this.editorBoard.emit('history:change', this.state());
	}

	// 开始批量操作
	beginBatch() {
		if (this.currentBatch) {
			this.endBatch();
		}
		// console.log('beginBatch', this.currentBatch)
	}

	// 结束批量操作
	endBatch() {
		// if (this.currentBatch && !this.currentBatch.isEmpty()) {
		// 	const batch = this.currentBatch;
		// 	batch.execute();
		// 	this.undoStack.push(batch);
		// 	this.redoStack = [];

		// 	if (this.undoStack.length > this.maxHistorySize) {
		// 		this.undoStack.shift();
		// 	}
		// }
		// this.currentBatch = null;
	}

	// 撤销
	undo() {
		if (this.canUndo()) {
			// 获取删除后最后一个元素进行撤销
			// 如果撤回命令为空，则不进行任何操作
			if (this.undoStack.length === 0) return;
			const command = this.undoStack.pop() as ICommand
			command.undo()
			this.redoStack.push(command)
			this.editorBoard.emit('history:change', this.state());
		}
	}

	// 重做
	redo() {
		if (this.canRedo()) {
			const command = this.redoStack.pop() as ICommand
			command.redo();
			this.undoStack.push(command);
			this.editorBoard.emit('history:change', this.state());
		}
	}

	// 检查是否可以撤销
	canUndo() {
		return this.undoStack.length > 0;
	}

	// 检查是否可以重做
	canRedo() {
		return this.redoStack.length > 0;
	}

	// 清空历史记录
	destroy() {
		this.undoStack = [];
		this.redoStack = [];
		this.currentBatch = null;
	}

	// 获取历史记录信息（用于UI显示）
	state() {
		return {
			undoStack: this.undoStack,
			redoStack: this.redoStack,
			undoCount: this.undoStack.length,
			redoCount: this.redoStack.length,
			canUndo: this.canUndo(),
			canRedo: this.canRedo()
		};
	}
}