# Loon Skill

这是一个运行在 [Minis](https://openminis.app) 环境中的 Loon 技能。

该技能用于辅助处理 Loon 配置、规则、策略组、节点、DNS、复写、脚本、插件、Scheme、订阅解析器和 Script API 等相关问题。

## Minis

- 官网：[https://openminis.app](https://openminis.app)
- GitHub：[https://github.com/OpenMinis](https://github.com/OpenMinis)

## 项目说明

这是一个抛砖引玉性质的项目，目前主要实测了 Loon 插件相关的部分能力，也是制作这个技能的初衷：把反复复制、整理 Loon 语法和示例的过程交给 Minis 辅助完成。

需要注意的是，技能效果非常依赖模型能力。不同模型可能会生成“功能一致但写法不同”的内容，也可能在复杂场景下直接翻车。因此，本技能更适合作为辅助工具，而不是完全拿来即用的成品方案。

使用者最好具备一点 Loon 基础，能够判断生成内容是否符合自己的配置环境。使用过程中，也可以根据实际需求继续投喂相关资料、纠正模型输出，并通过记忆逐步培养成更适合自己使用场景的技能。

## 运行环境

- 适用于 Minis 技能系统。
- 技能入口文件为 `SKILL.md`。
- 参考资料位于 `references/` 目录。
- 使用时由 Minis 根据用户问题自动读取技能说明和相关参考文件。
- 如需让技能直接读取或写入本地 Loon 配置、插件、脚本等文件，需要在 Minis 中挂载 Loon 的 iCloud 目录。

## 主要用途

- 查询和整理 Loon 官方文档要点。
- 生成或修改 Loon 配置片段。
- 编写 Loon 插件、复写、规则和脚本示例。
- 辅助分析订阅解析器、Script API、MitM、Rewrite 等用法。

## 目录结构

```text
Skills/Loon/
├── README.md
├── SKILL.md
└── references/
```

`SKILL.md` 定义技能的触发范围、使用流程和输出约束；`references/` 保存按主题整理的 Loon 参考资料。

希望每一位 Loon 用户都有自己的专属配置，祝大家用得开心。
