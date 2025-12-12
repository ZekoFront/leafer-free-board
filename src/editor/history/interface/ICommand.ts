import type { EditorBoard } from "@/editor"
import type { IPointData } from "leafer-ui"

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

export interface IHistoryCommandProps {
   elementId:string
   tag: string 
   editor: EditorBoard
   oldXYValue: IPointData
   newXYValue: IPointData
   desc?: string
}


export interface IMoveData {
    id: string
    old: {
        x: number
        y: number
    }
    new: {
        x: number
        y: number
    }
}

// 扩展传入构造函数的 Props
export interface IMoveCommandProps extends Omit<IHistoryCommandProps, 'elementId' | 'oldXYValue' | 'newXYValue'> {
    // 这是一个数组，存储所有被移动元素的信息
    moveList: IMoveData[]; 
}