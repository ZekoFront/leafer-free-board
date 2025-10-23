// src/history/commands/BaseCommand.ts
import { App, type ILeaf, type IUI, type IUIInputData } from 'leafer-ui'
import type { ICommand } from '../interface/ICommand'
import type EditorBoard from '@/editor/EditorBoard'

export abstract class BaseCommand implements ICommand {
  protected editorBoard: EditorBoard
  public id: string
  public type: string
  protected timestamp: number
  protected compressed: boolean = false
  protected compressedData?: any
  public elementId: string

  constructor(elementId: string, editorBoard: EditorBoard, type:string) {
    this.editorBoard = editorBoard
    this.type = type
    this.elementId = elementId
    this.id = `${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.timestamp = Date.now()
  }

  abstract execute(): void
  abstract undo(): void
  abstract redo(): void

  // 属性过滤
  filterElementProperties(element: IUIInputData) {
      if (!element) return {}

      const properties = {
          id: element.id,
          tag: element.tag,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          rotation: element.rotation,
          scaleX: element.scaleX,
          scaleY: element.scaleY,
          fill: element.fill,
          stroke: element.stroke,
          opacity: element.opacity,
          draggable: element.draggable,
          editable: element.editable,
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
      }
      return properties
  }

  // 压缩命令数据
  compress(): void {
    if (!this.compressed) {
      this.compressedData = JSON.stringify(this)
      // 清空原始数据以节省内存
      Object.keys(this).forEach(key => {
        if (key !== 'id' && key !== 'type' && key !== 'compressed' && key !== 'compressedData') {
          // @ts-ignore
          delete this[key]
        }
      })
      this.compressed = true
    }
  }

  // 恢复命令数据
  decompress(): void {
    if (this.compressed && this.compressedData) {
      const data = JSON.parse(this.compressedData)
      Object.assign(this, data)
      this.compressed = false
      this.compressedData = undefined
    }
  }
}