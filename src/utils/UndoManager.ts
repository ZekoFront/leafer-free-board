/**
 * Command interface for undo/redo operations
 */
export interface Command {
  undo: () => void;
  redo: () => void;
  groupId?: string;
}

/**
 * UndoManager class for managing undo/redo operations
 */
export class UndoManager {
  private commands: Command[] = [];
  private index: number = -1;
  private limit: number = 0;
  private isExecuting: boolean = false;
  private callback?: () => void;

  /**
   * Executes a single command.
   * @param command - Command to execute
   * @param action - "undo" or "redo"
   */
  private execute(command: Command, action: 'undo' | 'redo'): UndoManager {
    if (!command || typeof command[action] !== 'function') {
      return this;
    }
    this.isExecuting = true;

    command[action]();

    this.isExecuting = false;
    return this;
  }

  /**
   * Adds a command to the queue.
   * @param command - Command to add
   */
  public add(command: Command): UndoManager {
    if (this.isExecuting) {
      return this;
    }
    // if we are here after having called undo,
    // invalidate items higher on the stack
    this.commands.splice(this.index + 1, this.commands.length - this.index);
    this.commands.push(command);

    // if limit is set, remove items from the start
    if (this.limit && this.commands.length > this.limit) {
      this.removeFromTo(this.commands, 0, -(this.limit + 1));
    }

    // set the current index to the end
    this.index = this.commands.length - 1;
    if (this.callback) {
      this.callback();
    }
    return this;
  }

  /**
   * Pass a function to be called on undo and redo actions.
   * @param callbackFunc - Callback function
   */
  public setCallback(callbackFunc: () => void): void {
    this.callback = callbackFunc;
  }

  /**
   * Performs undo: call the undo function at the current index and decrease the index by 1.
   */
  public undo(): UndoManager {
    let command = this.commands[this.index];
    if (!command) {
      return this;
    }

    const groupId = command.groupId;
    while (command.groupId === groupId) {
      this.execute(command, 'undo');
      this.index -= 1;
      command = this.commands[this.index];
      if (!command || !command.groupId) break;
    }

    if (this.callback) {
      this.callback();
    }
    return this;
  }

  /**
   * Performs redo: call the redo function at the next index and increase the index by 1.
   */
  public redo(): UndoManager {
    let command = this.commands[this.index + 1];
    if (!command) {
      return this;
    }

    const groupId = command.groupId;
    while (command.groupId === groupId) {
      this.execute(command, 'redo');
      this.index += 1;
      command = this.commands[this.index + 1];
      if (!command || !command.groupId) break;
    }

    if (this.callback) {
      this.callback();
    }
    return this;
  }

  /**
   * Clears the memory, losing all stored states. Resets the index.
   */
  public clear(): void {
    const prevSize = this.commands.length;

    this.commands = [];
    this.index = -1;

    if (this.callback && prevSize > 0) {
      this.callback();
    }
  }

  /**
   * Tests if any undo actions exist.
   */
  public hasUndo(): boolean {
    return this.index !== -1;
  }

  /**
   * Tests if any redo actions exist.
   */
  public hasRedo(): boolean {
    return this.index < this.commands.length - 1;
  }

  /**
   * Returns the list of queued commands.
   * @param groupId - Optionally filter commands by group ID
   */
  public getCommands(groupId?: string): Command[] {
    return groupId ? this.commands.filter(c => c.groupId === groupId) : this.commands;
  }

  /**
   * Returns the index of the actions list.
   */
  public getIndex(): number {
    return this.index;
  }

  /**
   * Sets the maximum number of undo steps. Default: 0 (unlimited).
   * @param max - Maximum number of undo steps
   */
  public setLimit(max: number): void {
    this.limit = max;
  }

  /**
   * Helper function to remove elements from an array
   * @param array - Array to modify
   * @param from - Start index
   * @param to - End index (optional)
   * @returns The new length of the array
   */
  private removeFromTo(array: any[], from: number, to?: number): number {
    // 计算要删除的元素数量
    let deleteCount: number;
    
    if (to === undefined) {
      // 如果没有提供to，则从from开始删除到数组末尾
      deleteCount = array.length - from;
    } else {
      // 计算from到to之间的元素数量（包括to）
      deleteCount = to - from + 1;
      
      // 处理负索引情况
      if (to < 0 || from < 0) {
        const isFromNegative = from < 0;
        const isToNegative = to < 0;
        
        // 如果from和to的符号不同（一个是负数，一个是非负数）
        if (isFromNegative !== isToNegative) {
          // 调整删除数量
          if (to < 0) {
            deleteCount += array.length;
          }
        }
      }
    }
    
    // 执行删除操作
    array.splice(from, deleteCount);
    
    return array.length;
  }
}