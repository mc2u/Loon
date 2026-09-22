# Loon 插件

## 资源解析器

把 Clash/Mihomo YAML、节点 URI、整包 Base64、Loon 标准节点行统一转换为 Loon 原生节点行。

- 节点名称处理：前缀、后缀、文本替换、去除 Emoji
- 关键词排序、关键词排除节点（对导入节点同样生效）
- 自定义 UA 拉取订阅（拉取失败或无法处理时回退原订阅）
- 逐行导入节点，与订阅合并后统一输出
- TLS ClientHello 指纹改写

不适用于加密订阅。请到订阅管理界面对单个订阅配置解析器。

一键导入：

[导入资源解析器](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fmc2u%2FLoon%2Frefs%2Fheads%2Fmain%2FPlugins%2Floon_resource_parser.lpx)

## 节点助手

专注于散装节点管理。把插件参数里填入的节点链接通过 `http://nodes.loon` 吐出去，供 Loon 以节点订阅方式导入。

- 只支持明文节点链接，一行一个（`vless://` `anytls://` `ss://` `vmess://` 等）
- 自动跳过空行与完全重复的行，保持填写顺序
- 不含任何联网抓取，不做协议转换，完全离线自足

不支持 `名字#链接`、整包 Base64、`http/https` 订阅链接。填好后点插件页的按钮即可导入。

一键导入：

[导入节点助手](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fmc2u%2FLoon%2Frefs%2Fheads%2Fmain%2FPlugins%2Floon_nodes.lpx)

## 更新记录

- 20260923：新增 节点助手 插件（散装节点管理，纯本地导入，不联网）。
- 20260922：插件参数扩至 12 个（新增 排除节点、导入节点、TLS 指纹、超时配置）；改用 Script V2 语法；脚本侧支持 URI→原生行转换、手写 YAML 单轨解析、失败即保留原行。
- 20260623：增加 YAML 格式转换（简易）。
