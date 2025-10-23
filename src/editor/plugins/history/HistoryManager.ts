// import { CompositeCommand } from './commands/CompositeCommand.js';
import { isEqual } from 'lodash-es'

import type { ICommand } from "./interface/ICommand";
import { ExecuteTypeEnum, type ExecuteTypes, type IPluginOption, type IPluginTempl } from '@/editor/types';
import type { IUIInputData } from 'leafer-ui';
import { AddElementCommand } from './index';
import type EditorBoard from '@/editor/EditorBoard';

// 历史记录管理器 - 核心撤销重做逻辑
export class HistoryManager implements IPluginTempl {
	static pluginName: string="HistoryManager";
    static events: string[] = [];
    static apis: string[] = ['undo','redo','isCanUndo','isCanRedo','clearHistory', 'history','execute'];
	private maxHistorySize: number // 历史记录最大数量
	private undoStack: ICommand[] = [] // 撤销栈
  	private redoStack: ICommand[] = [] // 重做栈
	// private cleaning: boolean = false // 是否正在清理
	private currentBatch: ICommand | null = null // 当前批量操作命令
	constructor(public editorBoard: EditorBoard, options: IPluginOption) {
		this.maxHistorySize = Number(options.maxHistorySize) || 100;
		this.undoStack = [];
		this.redoStack = [];
		this.currentBatch = null;
		// this.cleaning = false
	}

	// 执行命令
	execute<T extends object & { tag?: string, type?: ExecuteTypes }>(element: T) {
		if (!element) return
		// leafer 元素
		if (element.tag) {
			const leafer = element as IUIInputData
			const command = new AddElementCommand({ element:leafer, editorBoard: this.editorBoard, type: ExecuteTypeEnum.AddElement })
			this.addCommand(command)
		} else if (element.type === ExecuteTypeEnum.AddElement) {
			
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
	}

	// 开始批量操作
	beginBatch() {
		if (this.currentBatch) {
			this.endBatch();
		}
		// this.currentBatch = new CompositeCommand();
		console.log('beginBatch', this.currentBatch)
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
		}
	}

	// 重做
	redo() {
		if (this.canRedo()) {
			const command = this.redoStack.pop() as ICommand
			command.execute();
			this.undoStack.push(command);
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
	clearHistory() {
		this.undoStack = [];
		this.redoStack = [];
		this.currentBatch = null;
	}

	// 获取历史记录信息（用于UI显示）
	history() {
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