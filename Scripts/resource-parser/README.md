# Loon Resource Parser

用于 Loon 节点订阅的资源解析脚本，可在订阅加载时自动整理节点名称。

脚本文件：

```text
loon_resource_parser.js
```

## 功能

- 添加节点名前缀
- 添加节点名后缀
- 去除节点名中的 emoji
- 普通文本替换
- 使用 Shadowrocket User-Agent 重新拉取订阅
- 按订阅 URL 保存独立配置
- 重置当前订阅配置

---

## 支持参数

多个参数使用 `&` 连接。

> 如果订阅编辑界面的参数输入框内出现 `xxx = https...` 这类内容，直接点 `x` 删除掉，重新填写需要的参数即可。

| 参数 | 作用 | 示例 |
|---|---|---|
| `pre=` | 给节点名添加前缀 | `pre=🍑` |
| `suf=` | 给节点名添加后缀 | `suf=🍓` |
| `emoji` | 去除节点名中的 emoji | `emoji` |
| `rename=` | 普通文本替换 | `rename=香港:HK,日本:JP` |
| `ua` | 使用 Shadowrocket User-Agent 重新拉取订阅 | `ua` |
| `reset` | 清空当前订阅已保存的配置 | `reset` |

---

## 参数说明

### `pre=`

给所有节点名称前面添加指定内容。

示例：

```text
pre=🍑
```

处理前：

```text
香港 01
```

处理后：

```text
🍑香港 01
```

### `suf=`

给所有节点名称后面添加指定内容。

示例：

```text
suf=🍓
```

处理前：

```text
香港 01
```

处理后：

```text
香港 01🍓
```

### `emoji`

去除节点名称中的 emoji。

示例：

```text
emoji
```

处理前：

```text
🇭🇰 香港 01 🚀
```

处理后：

```text
香港 01
```

### `rename=`

对节点名执行普通文本替换。

格式：

```text
rename=旧文本:新文本
```

多个替换规则使用英文逗号分隔：

```text
rename=香港:HK,日本:JP,新加坡:SG
```

处理前：

```text
香港 01
日本 02
新加坡 03
```

处理后：

```text
HK 01
JP 02
SG 03
```

### 删除指定文字

如果想删除某段文字，可以把替换后的内容留空。

示例：

```text
rename=0.1倍:
```

处理前：

```text
香港 01 0.1倍
```

处理后：

```text
香港 01
```

### `ua`

使用 Shadowrocket User-Agent 重新拉取当前订阅。

示例：

```text
ua
```

### `reset`

清空当前订阅已保存的参数配置。

示例：

```text
reset
```

---

## 组合示例

### 去除 emoji 后添加前缀

```text
pre=🍑&emoji
```

处理前：

```text
🇭🇰 香港 01
```

处理后：

```text
🍑香港 01
```

### 删除倍率后添加前缀

```text
pre=🍑&rename=0.1倍:
```

处理前：

```text
香港 01 0.1倍
```

处理后：

```text
🍑香港 01
```

### 同时添加前缀、后缀并去除 emoji

```text
pre=🍑&suf=🍓&emoji
```

处理前：

```text
🇭🇰 香港 01
```

处理后：

```text
🍑香港 01🍓
```

### 使用 Shadowrocket UA 并添加前缀

```text
ua&pre=🍑
```

### 使用 Shadowrocket UA 并去除 emoji

```text
ua&emoji
```

### 使用 Shadowrocket UA，去 emoji，删除倍率并添加前缀

```text
ua&pre=🍑&emoji&rename=0.1倍:
```

---

## 处理顺序

脚本按以下顺序处理：

1. 根据 `ua` 决定是否重新拉取订阅
2. 去除 emoji
3. 执行 `rename` 文本替换
4. 添加 `pre` 前缀
5. 添加 `suf` 后缀

示例：

```text
pre=🍑&emoji&rename=香港:HK
```

处理流程：

```text
🇭🇰 香港 01
→ 香港 01
→ HK 01
→ 🍑HK 01
```

---

## 配置保存机制

脚本会按照订阅 URL 单独保存配置：

- 不同订阅互不影响
- 每个订阅可以保存自己的参数
- 下次不重新填写参数时，会优先使用该订阅之前保存的配置

---

## 日志说明

脚本会输出日志，便于确认是否生效。

常见日志：

```text
[解析器] 已读取本地配置
[解析器] 已更新配置
[解析器] 已重置配置
[解析器] 当前配置: pre=🍑, emoji, rename=0.1倍:
[解析器] 已修改节点数: 20
[解析器] 处理完成
```
