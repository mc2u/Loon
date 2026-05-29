# Loon 插件参考

这份文档用于整理插件的常见写法、参数和使用时需要注意的事项。

## Loon 插件文件后缀

- `.lpx`：Loon Plugin Extension，Loon 插件扩展。
- 生成 Loon 插件或保存到本地插件目录时，使用 `.lpx` 后缀。

## 插件是什么

插件是规则、复写、脚本的集合。

可以把插件理解成：

- 一个子配置
- 一个扩展功能包

## 常见格式

```ini
plugin-url tag=tag,proxy=插件中PROXY映射策略,enable=true
```

说明：

- `tag` 用来标识插件
- `proxy` 用来把插件中的 `PROXY` 映射到当前配置里的实际策略
- `enable=true` 表示启用

## 插件头字段

常用插件头字段包括：

- `#!name`：插件名称
- `#!desc`：插件描述
- `#!author`：作者
- `#!homepage`：主页链接
- `#!icon`：图标链接
- `#!input` / `#!select`：旧式输入与选择声明
- `#!system` / `#!system_version` / `#!loon_version`：兼容范围
- `#!tag`：分类标签

需要带参数的可复制结构时，使用下面的完整插件示例。

## 带参数的完整插件示例

```ini
#!name= 插件名称
#!desc= 这是一个带有配置项的插件，input代表输入，select代表选择（select的第一项为名称，后面为可选值），用户所填或者选择的值都可以在脚本中用$persistentStore.read进行读取，如$persistentStore.read(appName)
#!author= 插件作者
#!homepage= 插件首页，可在插件页面进行跳转
#!icon= 插件的图标
#!input = appName
#!input = author
#!select = appType,tool,social,health,sport
#!select = price,0.99,1.99,4.99
#!system = iOS,iPadOS,tvOS,macOS
#!system_version = 15
#!loon_version = 3.2.1(372)
#!tag = 去广告,Youtube

[Argument]
arg1 = input,"default-placehodler-content",tag=参数1的标题,desc=这是一个输入参数的说明
arg2 = select,"select1","select2","select2",tag=参数2的标题,desc=这是一个选择类型的参数说明
arg3 = switch,true,tag=参数3的标题,desc=这是一个true、false的切换参数

[General]
bypass-tun =
skip-proxy =
real-ip =
dns-server =

[Rule]

[Rewrite]

[Host]

[Script]
http-response ^https?:\/\/example\.com\/conf\/server-mapping script-path = remove_ads.js, requires-body = true, tag = 移除广告,argument=[{arg1},{arg2},{arg3}]

[MITM]
hostname = example.com
```

## 参数类型

### input

- 需要用户在界面输入内容
- 后面的参数值作为默认内容

### select

- 需要用户在界面里选择内容
- 后面的参数值就是可选项
- 默认会选择后续配置中的第一个值

### switch

- 在界面显示为开关
- 默认值通常是 `true` 或 `false`

参数格式原样示例：

```ini
参数变量名 = 类型,"参数值1","参数值2",tag=参数在UI上显示的名字,desc=参数在UI上显示详细介绍
```

## 参数传递示例

```ini
argument=[{arg1},{arg2},{arg3}]
```

脚本中可以通过：

```javascript
$argument.arg1
```

来读取参数。

## 使用时常见限制

插件可能会受这些条件影响：

- Loon 版本
- 系统版本
- 平台支持情况
- 来源是否可信

## 插件中规则的策略

插件里的规则通常只能使用以下策略：

- `DIRECT`
- `REJECT` 类
- `PROXY`

其中：

- `PROXY` 代表用户在插件配置时手动选择的策略组
- 如果插件里写了 `PROXY`，但用户没有正确配置，实际效果可能不符合预期

## 插件和其他模块的关系

插件通常不只是单独的一份规则文件，也可能同时包含：

- 规则
- 复写
- 脚本
- MitM 相关内容

## 文件命名、目录与配置写入约定

- Loon 插件文件使用 `.lpx` 后缀。
- 生成或保存到 Loon 本地插件目录时，命名为 `xxx.lpx`。
- 挂载的 Loon 目录通常包含：`Plugins/`、`Scripts/`、`Rewrite/JQ/`、`Mock/`。
- `Plugins/` 只放插件文件：`.lpx`。
- `Scripts/` 只放脚本文件：`.js`。
- `Rewrite/JQ/` 放外部 jq 文件：`.jq`；普通短 jq 优先内联在复写规则里。
- `Mock/` 放 `mock-request-body` / `mock-response-body` 的本地 `data-path` 资源，例如 `.json`、`.txt`、`.raw`、图片/视频等。
- 本地插件引用本地脚本时，插件保存在 `Plugins/xxx.lpx`，脚本保存在 `Scripts/xxx.js`，插件内使用相对写法：`script-path=xxx.js`。
- 生成或安装本地 Loon 插件后必须复查目录，确保 `Plugins/` 下没有误放 `.js`、`.jq` 或 mock 数据文件。
- **默认不要把新生成的插件、规则、脚本或复写内容写入任何 `.lcf` 配置文件**，包括 `Configs/default.lcf`。
- 只有用户明确要求“写入配置 / 启用 / 添加到 lcf / 加到 default.lcf / 更新配置文件”时，才编辑 `.lcf`。
- 如确需写入 `.lcf`，只新增或更新用户要求的相关引用行/配置行，不得整理、重排或修改其他无关内容。

正确示例：

```text
/var/minis/mounts/Loon/Plugins/ippure_node_quality.lpx
/var/minis/mounts/Loon/Scripts/ippure_node_quality.js
/var/minis/mounts/Loon/Rewrite/JQ/example_filter.jq
/var/minis/mounts/Loon/Mock/example_response.json
```

插件内：

```ini
[Script]
generic script-path=ippure_node_quality.js,tag=IPPure 节点质量检测,timeout=30,enable=true
```

## 插件中的 MITM 写法

插件里需要 HTTPS 解密时，应使用标准 `[MITM]` 段，并写明 `hostname =`：

```ini
[MITM]
hostname = example.com,*.example.org
```

不要只在 `[MITM]` 下单独写域名；生成插件时必须包含 `hostname = 域名`。
