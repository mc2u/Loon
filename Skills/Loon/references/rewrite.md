# Loon 复写参考

这份文档用于整理复写的说明、处理顺序和完整写法。

## JQLang 文件后缀

- JQLang 官方教程：`https://jqlang.org/tutorial/`
- `.jq`：复写使用的 JQLang 命令文件。普通短 jq 优先直接写在 `response-body-json-jq` / `request-body-json-jq` 中；只有超大型、多行、带注释的 jq 才使用 `.jq` 文件。
- 本地 `.jq` 文件放 Loon 的 `Rewrite/JQ/` 目录，不放 `Plugins/` 或 `Scripts/`。

## 复写是什么

复写专门用来处理 HTTP / HTTPS 请求。

可以在：

- 请求发出前修改请求数据
- 响应返回后修改响应数据

可修改的内容包括：

- URL
- Header
- Body

复写只对：

- HTTP 请求
- 已解密的 HTTPS 请求

生效。

## 处理顺序

- 复写会先于规则匹配执行
- 本地配置中的复写优先级高于插件中的复写
- 同一文件中的复写，越靠上优先级越高

## 多次匹配

一个请求可以分别命中：

- 请求侧复写
- 响应侧复写

同一侧如果有多个复写要同时生效，通常需要使用相同的正则表达式去匹配同一个请求。

## URL 复写

```ini
^http://www\.google\.cn header http://www.google.com
```

## 重定向响应

```ini
^http://example.com 302 https://example.com
^http://example.com 307 https://example.com
```

## 拒绝响应

```ini
^http://example.com reject
^http://example.com reject-200
^http://example.com reject-img
^http://example.com reject-img-no-drop
^http://example.com reject-video
^http://example.com reject-video-no-drop
^http://example.com reject-dict
^http://example.com reject-dict-no-drop
^http://example.com reject-array
^http://example.com reject-array-no-drop
```

含义：

- `reject`：直接断开连接
- `reject-200`：返回 200，body 为空
- `reject-img`：返回 200，一像素图片
- `reject-img-no-drop`：返回 200，一像素图片，不会升级到 drop
- `reject-video`：返回 200，空白视频
- `reject-video-no-drop`：返回 200，空白视频，不会升级到 drop
- `reject-dict`：返回 200，body 为 `{}`
- `reject-dict-no-drop`：返回 200，body 为 `{}`，不会升级到 drop
- `reject-array`：返回 200，body 为 `[]`
- `reject-array-no-drop`：返回 200，body 为 `[]`，不会升级到 drop

注意：复写只对 HTTP 或已解密 HTTPS 生效；这些响应体类 reject 必须能看到 HTTP 请求，不能用于未解密 HTTPS/TCP 层流量。

## Request Header

单项示例：

```ini
^http://example.com header-add Connection keep-alive
^http://example.com header-del Cookie
^http://example.com header-replace User-Agent Unknown
^http://example.com header-replace-regex User-Agent regex replace-value
```

多项示例：

```ini
^http://example.com header-add Connection keep-alive Proxy-Connection keep-alive
^http://example.com header-del Cookie Connection
^http://example.com header-replace User-Agent Unknown Content-Length 1999 Content-Type application/json
^http://example.com header-replace-regex User-Agent regex replace-value Cookie UUID=123 UUID=456
```

## Request Body

完整示例：

```ini
^http://example.com request-body-replace-regex regex1 replace-value1 regex2 replace-value2
^http://example.com request-body-json-add data.apps[0] {"appName":"loon","appVersion":"3.2.1"} data.category tool
^http://example.com request-body-json-replace data.ad {}
^http://example.com request-body-json-del data.ad
^http://example.com request-body-json-jq 'del(.data.ad)'
```

说明：

- `request-body-json-*` 只在请求体本身是 JSON 时生效
- `keypath` 采用点分路径，例如 `data.apps[0].appname`
- `request-body-json-jq` 使用 jq 表达式处理 JSON

## Mock Request Body

完整示例：

```ini
^http://example.com mock-request-body data-type=text data=""
^http://example.com mock-request-body data-type=json data-path=request_body.json
^http://example.com mock-request-body data-type=png data-path=request_body.raw mock-data-is-base64=true
```

说明：

- `data-type` 可为 `json`、`text`、`css`、`html`、`javascript`、`plain`、`png`、`gif`、`jpeg`、`tiff`、`svg`、`mp4`、`form-data`
- `data` 直接写内容
- `data-path` 可写 URL 或本地文件路径；本地 mock 资源放 Loon 的 `Mock/` 目录
- `mock-data-is-base64=true` 表示数据是 base64 形式的二进制内容

## Response Header

```ini
^http://example.com response-header-add Connection keep-alive
^http://example.com response-header-del Cookie
^http://example.com response-header-replace User-Agent Unknown
^http://example.com response-header-replace-regex User-Agent regex replace-value
```

## Response Body

完整示例：

```ini
^http://example.com response-body-replace-regex regex1 replace-value1 regex2 replace-value2
^http://example.com response-body-json-add data.apps[0] {"appName":"loon","appVersion":"3.2.1"} data.category tool
^http://example.com response-body-json-replace data.ad {}
^http://example.com response-body-json-del data.ad
^http://example.com response-body-json-jq 'del(.data.ad)'
```

## Mock Response Body

完整示例：

```ini
^http://example.com mock-response-body data-type=text data="" status-code=200
^http://example.com mock-response-body data-type=json data-path=response_body.json status-code=200
^http://example.com mock-response-body data-type=svg data-path=response_body.raw mock-data-is-base64=true status-code=200
```

说明：本地 `data-path` 资源放 Loon 的 `Mock/` 目录；若使用远程 URL，则不需要本地 Mock 文件。

## 一个更完整的复写段示例

```ini
[Rewrite]
^http://www\.google\.cn header http://www.google.com
^http://example.com 302 https://example.com
^http://example.com reject-200
^http://example.com reject-video
^http://example.com header-add Connection keep-alive
^http://example.com request-body-json-del data.ad
^http://example.com response-header-del Cookie
^http://example.com response-body-json-jq 'del(.data.ad)'
```

## 使用提醒

- 如果正则表达式或替换内容里有空格，使用 `\x20` 表示空格
- JSON 相关复写只在请求体或响应体本身是 JSON 时生效
- 如果问题是“为什么复写没生效”，优先检查：
  1. 是否是 HTTP / 已解密 HTTPS
  2. 正则是否匹配
  3. 复写顺序
  4. 是否需要 MitM

## 根据实际抓包编写规则/复写/脚本的约定

当用户提供抓包文件、请求 URL、响应 body，要求编写或修改 Loon 规则、复写、脚本时，必须以抓包中的实际内容为准。抓包分析必须先逐项核对请求 host/path、method、请求体、原始响应体、替换后响应体；结论只能来自抓包里实际出现的字段和值，不能根据页面观感、业务名称或“可能存在的常见字段”自行联想补条件。

- URL 正则只覆盖抓包里实际出现的 host 与 path，不要无依据扩展到其他域名，例如抓包只有 `api.example.com` 就不要写成 `(api|www|m)\.example\.com`。
- 不要为了“防守兼容”添加抓包中没有出现的字段判断；例如抓包没有 `is_ads`、`model_type = "ads"`、`type = "ads"`，就不要把这些条件加入 jq。若后续新抓包证明存在，再追加。
- 响应字段判断只使用抓包中已经确认存在且能表达目标含义的字段；优先选择稳定、短小的字段，例如 `recommend.type == "hot_reason"`，不要在没有必要时同时叠加多个冗余条件。
- jq 复写优先写最小可用表达式；避免为了“兼容可能情况”把表达式写得过长。
- 同一接口存在 `items`、`item_list`、`tab_list` 等多个列表时，分别按抓包确认的真实结构处理；不要把一个列表里的字段条件套到另一个列表。
- 只有当多个抓包样本证明同一功能分布在多个 host/path/字段时，才扩大正则或增加备用判断。
- 静态 JSON 修改优先用 `response-body-json-jq`；需要跨请求缓存、复杂计算、媒体地址回填时再使用 `[Script]`。
- 域名/协议层拦截优先用 `[Rule]`；HTTP body/header 修改才用 `[Rewrite]`；两者不要混用来实现同一个简单目标。
- 修改用户已有插件时，先读取挂载目录中的当前文件，以当前内容为基准做最小改动，不要按历史旧版本覆盖用户整理过的内容。
- 如果用户要求“检查是否生效”，必须对比原始响应与替换后响应，指出哪些字段确实变化、哪些推广/控件仍残留；发现残留时也要说明依据字段，不要直接宣称已解决。

示例：如果抓包为 `api.example.com/v1/feed`，目标字段为 `.recommend.type = "promo"`，则复写应优先写成：

```ini
^https?:\/\/api\.example\.com\/v\d+\/feed\? response-body-json-jq '.data |= map(select(.recommend.type != "promo"))'
```

不要在没有抓包依据时写成：

```ini
^https?:\/\/(api|www|m)\.example\.com\/v\d+\/feed\? ...
```

## jq 常用动作速查（response-body-json-jq）

JQLang 官方教程：`https://jqlang.org/tutorial/`

写脚本前先看这张表，能用 jq 一行表达的事，直接用 Rewrite。

### jq 基础要点（来自官方教程）

- `.` 是最简单的 jq 程序，表示输入原样输出；也常用于格式化 JSON。
- `.foo` 访问对象字段，`.foo.bar` 访问嵌套字段。
- `.[0]` 访问数组第一个元素。
- `.[]` 遍历数组或对象的每个元素，输出为 JSON 值流。
- `|` 管道会把左侧过滤器的输出传给右侧过滤器，例如 `.[0] | {message: .commit.message}`。
- `{key: expr}` 可构造新对象，例如 `{message: .commit.message, name: .commit.committer.name}`。
- `[expr]` 会把表达式产生的多个结果收集成一个数组，例如 `[.[] | {message: .commit.message}]`。
- 可在对象构造中嵌套收集数组，例如 `{parents: [.parents[].html_url]}`。
- jq 的数据模型是 JSON 值流；每个表达式会对输入流中的每个值执行，并可输出零个、一个或多个值。

### Loon Rewrite 中使用 jq 的约定

- `response-body-json-jq` / `request-body-json-jq` 只处理 JSON body。
- 普通短 jq 直接内联在复写规则中；只有超大型、多行、带注释的 jq 才单独写入 `.jq` 文件。
- 本地 `.jq` 文件放 Loon 的 `Rewrite/JQ/` 目录。
- 写 Loon 插件或配置时，jq 表达式通常放在单引号中；表达式内部字符串使用双引号。
- Loon 配置/插件中需要注意转义：正则里的反斜杠通常要写成 `\\d+` 这类形式。

### 常用动作

- 删除某字段：`del(.third_business.ring)`
- 删除多个字段：`del(.a, .b.c, .d[0])`
- 清空数组：`.hot_search_queries = []`
- 清空嵌套数组：`.preset_words.words = []`
- 过滤数组（删广告项）：`.data |= map(select(.type != "ad" and (.adjson // null) == null))`
- 修改某个字段值：`.is_kfree = true`
- 修改 URL 查询参数：`.paging.next |= gsub("ad_interval=-?\\d+"; "ad_interval=2147483647")`
- 组合多个改写：`del(.x) | .y = [] | .z.next |= gsub("a"; "b")`
- 判断字段为 null 或不存在：`(.foo // null) == null`
- 数组按条件批量修改字段：`.items |= map(. + {is_paid: false})`
- 筛选嵌套数组：`.items |= map(select(.tags | any(. == "ad") | not))`
- 按 type 分发处理：`.data |= map(if .type == "ad" then empty else . end)`

写法注意：
- 上述 jq 表达式按实际输出写法记录；生成 Loon 配置时不要额外给 `|` 加反斜杠。
- 不需要 `try/catch`：jq 原生对 `.foo.bar` 在 foo 为 null 时返回 null 不会抛错
- 用 `//` 提供默认值：`.adjson // null`
- `|=` 是“原地更新”：`.data |= map(...)` 等价于 `.data = (.data | map(...))`
- 多个 jq 操作用 `|` 串起来，写在一行字符串里
- 字符串里有反斜杠时，lpx 文件里要写 `\\d+` 这种双反斜杠

什么情况下 jq 不够用，必须上 [Script]：

- 字段是 base64 编码的 JSON 或 protobuf，需要解码再改
- 改写依赖跨请求状态（`$persistentStore`）
- 需要根据当前响应再发起一次 `$httpClient` 请求拼接结果
- 改写后要 `$notification.post` 通知用户
- jq 表达式拆成 5 行还说不清楚的复杂条件分支
