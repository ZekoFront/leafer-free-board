# Cursor AI 配置

本目录为 **leafer-free-board** 项目的 AI 辅助配置。

## Rules（`.cursor/rules/`）

| 文件 | 作用 |
|------|------|
| `project-core.mdc` | 全局：架构分层、命名、插件顺序 |
| `plugins.mdc` | 编写 `src/plugins/**` |
| `elements-geometry.mdc` | 元素工厂、连线几何 |
| `vue-ui-theme.mdc` | 组件、元素库、主题 |

Rules 在匹配文件或 `alwaysApply: true` 时自动生效。

## Skills（`.cursor/skills/`）

| Skill | 用途 |
|-------|------|
| `leafer-board-dev` | 项目总览、检查清单、快照结构 |
| `leafer-add-plugin` | 新增 EditorCore 插件 |
| `leafer-add-element` | 新增元素库项与工厂 |

在对话中提及相关任务时，Agent 可加载对应 Skill；也可显式 `@leafer-add-element` 等引用。

## 架构文档

详细设计见仓库根目录 [`新架构文档.md`](../新架构文档.md)。
