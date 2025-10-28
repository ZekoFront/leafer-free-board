export interface ICommand {
    /** 执行命令 */
    execute(): void
    /** 撤销命令 */
    undo(): void
    /** 重做命令 */
    redo(): void
    /** 获取命令标识 */
    // get id(): string
    /** 获取命令类型 */
    // get type(): string
    /** 克隆命令 */
    // clone?(): ICommand
    /** 压缩命令数据 */
    compress?(): void
    /** 恢复命令数据 */
    decompress?(): void
    /** 校验命令是否有效 */
    isValid?(): boolean
}