# Loon 解析器参考

这份文档用于说明资源解析器的输入、类型和最小模板。

## 适用范围

- 官方资源类型枚举包含 `config`、`nodes`、`rules`、`rewrites`、`scripts`、`plugin`。
- 订阅解析器插件示例用于解析订阅节点资源，典型目标是 `1 = nodes`。
- 不要把订阅解析器误写成普通复写脚本；解析器最终应返回资源字符串。
- 如果用户要处理规则、复写、脚本或插件资源，应优先按对应配置段、插件或远程资源本身的语法处理；只有用户明确要求写资源解析器时，才按 `$resourceType` 分支处理对应资源类型。

## 解析器里常用的变量

- `$resource`：资源内容，字符串
- `$resourceUrl`：资源 URL，字符串
- `$resourceType`：资源类型，枚举值见下方
- `$argument`：解析器插件 `[Argument]` 注入的参数对象
- `$done(result)`：返回处理后的资源内容

## 资源类型

- `0 = config`
- `1 = nodes`
- `2 = rules`
- `3 = rewrites`
- `4 = scripts`
- `5 = plugin`

## 最小模板

```javascript
var result = $resource

// 在这里对订阅节点内容做过滤、替换或重组

$done(result)
```

## 理解方式

可以把解析器理解成下面这几步：

1. 读取原始订阅节点内容
2. 对节点内容做过滤、替换或重组
3. 返回新的订阅节点结果

## 回答建议

当用户问“解析器怎么写”“订阅怎么转换”“节点资源怎么预处理”时，可以按下面顺序说明：

1. 输入是订阅节点资源
2. 需要对节点做什么处理
3. 处理后的节点内容是什么格式
4. 最后怎样用 `$done(result)` 返回

如果用户问规则、复写、脚本、插件资源的预处理，先说明：解析器目前只支持订阅节点；再改用对应类型的 Loon 配置或插件方案。

## 官方订阅解析器插件示例（2026-06）

Loon 3.5.0(969) 起，订阅解析器可以用插件形式声明，插件头需要包含：

```ini
#!type=parser
```

官方示例：

```ini
#!name=Loon订阅解析器示例
#!desc=专门用于解析订阅节点的插件，这是一个插件示例，内容原样返回，无任何作用
#!openUrl=https://nsloon.app
#!author=Loon0x00[https://github.com/Loon0x00/LoonExampleConfig]
#!tag=解析器,官方,Demo
#!system=
#!system_version=
#!loon_version=3.5.0(969)
#!homepage=https://nsloon.app
#!icon=https://raw.githubusercontent.com/Loon0x00/Loon0x00.github.io/main/static/img/loon.png
#!date=2026-06-11 11:11:35
#!type=parser

[Argument]
UA = input,"Loon",tag=请求订阅的UA,desc=发起请求时用到的UA
resourceUrlOnly = switch,true,tag=忽略 Loon 自身解析数据,desc=忽略 Loon 自身解析数据
age-secret-key = input,"",tag=age 加密解密,desc=age 加密解密功能 可查看 https://t.me/zhetengsha/5876

[Script]
generic script-path=https://raw.githubusercontent.com/Loon0x00/LoonExampleConfig/refs/heads/master/Script/node_parser_ex.js,tag=NodeParser,timeout=10,,argument=[{UA},{resourceUrlOnly},{age-secret-key}]
```

要点：

- `[Argument]` 中的参数会以对象形式传给脚本的 `$argument`。
- 参数名可以包含连字符，例如 `age-secret-key`，脚本中用 `$argument["age-secret-key"]` 读取。
- `argument=[{UA},{resourceUrlOnly},{age-secret-key}]` 会把插件设置中的对应值注入到 `$argument`。
- `generic` 类型脚本用于解析器入口，最终仍通过 `$done(result)` 返回处理后的资源文本。

## 官方解析器脚本变量示例

官方示例脚本：

```javascript
/**
 * $resourceType: 解析器脚本自带全局变量，资源类型，枚举，详见下方
 * $resource: 解析器脚本自带全局变量，资源内容，string
 * $resourceUrl: 解析器脚本自带全局变量，资源url，string
 *
 * 资源类型
 * 0:config
 * 1:nodes
 * 2:rules
 * 3:rewrites
 * 4:scripts
 * 5:plugin
 */
let resourceType = $resourceType;
//资源内容
let resource = $resource;
//资源url
let url = $resourceUrl;

console.log("resourceType:" + resourceType);
console.log("resource url:" + url);

/*
* 下面是来自插件中的参数
*/
let pluginParams = console.log($argument);

let ua = $argument.UA
let resourceOnly = $argument.resourceUrlOnly
let ageKey = $argument["age-secret-key"]

console.log("ua:" + ua);
console.log("resourceOnly:" + resourceOnly);
console.log("ageKey:" + ageKey);

//$done(解析后的资源字符串)
$done("# generate by ResourceParserExample.js\n" + resource);
```

### 变量含义

- `$resourceType`：资源类型。订阅节点为 `1 = nodes`。
- `$resource`：Loon 传入解析器的资源内容。
- `$resourceUrl`：原始资源 URL。
- `$argument`：插件 `[Argument]` 注入的参数对象。
- `$done(result)`：返回解析后的资源字符串。

### 插件参数读取方式

```javascript
let ua = $argument.UA;
let resourceOnly = $argument.resourceUrlOnly;
let ageKey = $argument["age-secret-key"];
```

注意：新版解析器插件参数不是普通字符串，不能默认用 `$argument.toString()` 当作参数串处理；应优先按对象读取。

## `resourceUrlOnly` 的作用

官方示例中的 `resourceUrlOnly` 用于控制解析器是否忽略 Loon 传入的自身解析数据。常见理解：

- `resourceUrlOnly = false`：处理 Loon 传入的 `$resource`。
- `resourceUrlOnly = true`：脚本可根据 `$resourceUrl` 重新请求原始订阅内容，再处理新内容。

如果脚本要重新请求订阅，需要使用 `$httpClient` 并在失败时回退处理 `$resource`，避免返回空内容。
