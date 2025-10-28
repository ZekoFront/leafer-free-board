// // src/history/commands/SnapshotCommand.ts
// import { App, Group } from 'leafer-ui'
// import { BaseCommand } from './BaseCommand'

// export class SnapshotCommand extends BaseCommand {
//   private beforeState: any
//   private afterState: any
//   private targetId: string

//   constructor(elementId: string, app: App, target: Group, beforeState?: any, afterState?: any) {
//     super(elementId, app, 'snapshot')
//     this.targetId = target.id||""
//     this.beforeState = beforeState || this.captureState(target)
//     this.afterState = afterState || this.captureState(target)
//   }

//   // 捕获对象状态（只存储变化的部分）
//   private captureState(target: Group): any {
//     return {
//       position: { x: target.x, y: target.y },
//       scale: { x: target.scaleX, y: target.scaleY },
//       rotation: target.rotation,
//       visible: target.visible,
//       opacity: target.opacity,
//       zIndex: target.zIndex,
//       width: target.width,
//       height: target.height,
//       fill: target.fill,
//       stroke: target.stroke
//     }
//   }

//   execute(): void {
//     const target = this.app.tree.findId(this.targetId) as Group
//     if (target) this.applyState(target, this.afterState)
//   }

//   undo(): void {
//     const target = this.app.tree.findId(this.targetId) as Group
//     if (target) this.applyState(target, this.beforeState)
//   }

//   redo(): void {
//     this.execute()
//   }

//   private applyState(target: Group, state: any): void {
//     target.set({
//       x: state.position.x,
//       y: state.position.y,
//       scaleX: state.scale.x,
//       scaleY: state.scale.y,
//       rotation: state.rotation,
//       visible: state.visible,
//       opacity: state.opacity,
//       zIndex: state.zIndex,
//       width: state.width,
//       height: state.height,
//       fill: state.fill,
//       stroke: state.stroke
//     })
//   }
// }