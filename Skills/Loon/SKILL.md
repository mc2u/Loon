---
name: Loon
description: >
  Loon 配置、规则、策略组、节点、DNS、复写、脚本、插件、Scheme、订阅规则、Script API 等内容的说明、生成与修改技能。当用户明确提到 Loon，或在 Loon 上下文中提到配置文件转换、规则、策略组、节点筛选、DNS 映射、Rewrite、Plugin、Script、Script API、Scheme、订阅规则时，必须触发本技能。
compatibility: >
  优先使用本地索引与参考文件；需要补充细节时必须访问 https://nsloon.app/docs/intro/ 及其站内官方文档页面，不要用 GitHub 仓库或其他镜像替代官网文档。
---
## 用途

这个技能用于：

1. 定位 Loon 官方文档章节
2. 解释 Loon 语法、参数和用途
3. 生成或修改 Loon 配置
4. 回答脚本、插件、解析器、Scheme、MitM、Rewrite 等问题

## Loon 文件后缀约定

- `.lcf`：Loon Configuration File，Loon 配置文件。
- `.lsr`：Loon Shunt Rules，Loon 分流规则。
- `.lpx`：Loon Plugin Extension，Loon 插件扩展。
- `.ltx`：Loon Task Extension，Loon 任务扩展。
- `.jq`：复写使用的 JQLang 命令文件。普通短 jq 优先直接写在 `response-body-json-jq` / `request-body-json-jq` 中；只有超大型、多行、带注释的 jq 才使用 `.jq` 文件；本地文件放 Loon 的 `Rewrite/JQ/` 目录。
- Mock 资源：`mock-request-body` / `mock-response-body` 的本地 `data-path` 资源放 Loon 的 `Mock/` 目录。

## 本地生成与 `.lcf` 写入约束

- 默认只生成或保存对应文件：插件 `.lpx` 放 `Plugins/`，脚本 `.js` 放 `Scripts/`，规则 `.lsr` 放对应规则目录，外部 jq `.jq` 放 `Rewrite/JQ/`，mock 资源放 `Mock/`。
- **不要自动修改任何 `.lcf` 配置文件**（包括 `Configs/default.lcf`），也不要自动在 `[Plugin]`、`[Remote Rule]`、`[Rule]`、`[Script]`、`[Rewrite]` 等段落添加生成内容。
- 只有用户明确要求“写入配置 / 启用 / 添加到 lcf / 加到 default.lcf / 更新配置文件”时，才可以编辑 `.lcf`。
- 如确需编辑 `.lcf`，只改用户要求相关的最小段落和最小行，禁止整理、重排或顺手修改其他配置段。

## 官方文档来源

- 官方入口：`https://nsloon.app/docs/intro/`
- 查询、核对、补充 Loon 文档时，必须使用 `https://nsloon.app/docs/intro/` 及其站内官方文档页面。
- 不要用 GitHub 仓库、旧域名或第三方镜像替代官网文档；除非用户明确要求查仓库源码。

## 使用流程

### 1. 先看分类

先查 `references/index.md`，判断问题属于哪一类：

- 介绍
- 节点
- 策略
- 规则
- DNS
- 复写
- 插件
- 脚本
- Scheme
- 其他配置

### 2. 再选对应参考

- 节点 -> `references/node.md`
- 配置结构 -> `references/config.md`
- 策略 / 策略组 -> `references/policy.md`
- 规则 -> `references/rule.md`
- DNS / Host 映射 -> `references/dns.md`
- 脚本 -> `references/script.md`
- Script API -> `references/script_api.md`
- 解析器 -> `references/parser.md`
- 插件 -> `references/plugin.md`
- Scheme -> `references/scheme.md`
- 复写 -> `references/rewrite.md`
- MitM -> 结合 `references/config.md` 与官方文档说明

### 3. 再做方案决策（Rule / Rewrite / Script）

当任务涉及拦截、去广告、路由、改写、脚本时，在明确所属分类和参考语法后，按下面顺序选择**最小可用方案**，不要直接写脚本：

1. **能用 [Rule] 解决吗？**（屏蔽广告/埋点域名、拦截 URL、改路由）
   - 屏蔽域名 → `DOMAIN-SUFFIX,example.com,REJECT`
   - 屏蔽 IP → `IP-CIDR,192.0.2.1/32,REJECT,no-resolve`
   - 屏蔽 URL → `URL-REGEX,^https?://example\.com/,REJECT`
   - 改路由走向 → `DOMAIN-SUFFIX,example.org,PROXY`（`PROXY` 必须是已存在的策略组或插件映射策略）
   - 命中即停，不需要进入 Rewrite/Script

2. **能用 [Rewrite] 解决吗？**（改 HTTP 头/响应体/URL）
   - 改 JSON 响应字段（删字段、清数组、替换值、过滤数组项）→ `response-body-json-jq`
   - 简单文本替换 → `response-body-replace-regex`
   - 改请求头 → `header-replace`
   - 改响应头 → `response-header-replace`
   - URL 重定向 → `^https?://example\.com 302 https://new.example.com`
   - **凡是能用几行 jq / 正则表达的改写，不要写脚本**

3. **必须 [Script] 才行的场景**：
   - 需要 base64/protobuf/二进制解码后改写
   - 需要读写 `$persistentStore` 维持状态
   - 需要 `$httpClient` 发起额外请求拼接结果
   - 需要 `$notification.post` 通知用户
   - 定时任务（cron）

> 如果只是文档定位、语法解释、节点/策略组/DNS 等静态配置生成，不需要套用这条 Rule → Rewrite → Script 决策链。

### 4. 写脚本前检查

写脚本前先问自己：
- [ ] 任务本质是不是“改 JSON 字段 / 拦截 URL / 改 header”？如果是，回到 Rewrite/Rule
- [ ] 我有没有真实抓包数据验证过字段特征？没有的话不要写“防御性”过滤逻辑
- [ ] 我加的开关是用户真的需要的，还是我凭直觉造的？默认关的开关多半应该删掉
- [ ] 用 jq 在抓包样本上跑一遍能不能达到一样的效果？

只有这些都过了才进入脚本方案。

### 5. 回答时注意

- 语法解释优先看官方文档
- 配置生成优先保持 section 清晰
- 示例优先给最小可用版本
- 没把握的字段不要臆造，先查对应页面
- 明确区分“官方文档要点”“现有样例”“实践建议”
- 不要把 Surge、Quantumult X、Clash 的语法写成 Loon 语法

## 输出方式

### 文档定位类

尽量包含：

- 一级分类
- 小项名称
- 官方页面
- 一句话说明

### 语法说明类

尽量包含：

- 用途
- 语法或格式
- 参数解释
- 最小示例
- 常见误区

### 配置生成类

尽量包含：

- 所属配置段
- 最小可用示例
- 相关依赖说明（如策略组依赖节点名、规则依赖策略名）

## 参考文件

- `references/index.md`
- `references/node.md`
- `references/config.md`
- `references/policy.md`
- `references/rule.md`
- `references/dns.md`
- `references/script.md`
- `references/script_api.md`
- `references/parser.md`
- `references/plugin.md`
- `references/scheme.md`
- `references/rewrite.md`
