# Loon 脚本参考

这份文档用于整理脚本类型、脚本配置和常见写法。

> 如果要查脚本运行环境里的 API、回调和工具方法，请看 `references/script_api.md`。

## Loon 任务扩展文件后缀

- `.ltx`：Loon Task Extension，Loon 任务扩展。
- 当内容以任务、定时任务、脚本任务集合为核心时，可使用 `.ltx` 后缀。

## 脚本类型

- `http-request`：获得请求时触发
- `http-response`：获得响应时触发
- `cron`：按定时规则触发
- `network-changed`：网络变化时触发
- `generic`：手动触发，可配合节点、策略组、规则等使用

## 官方脚本配置示例

```ini
http-request ^https?:\/\/(www.)?(example)\.com script-path=localscript.js,tag = requestScript,requires-body = true,timeout = 10,binary-body-mode = false,argument = "1234",enable=true

http-response ^https?:\/\/(www.)?(example)\.com script-path=https://example.com/loon.js,timeout=10,requires-body = true,tag = responseScript,enable=true,timeout = 10,binary-body-mode = false,argument = "1234",enable=true

cron "0 8 * * *" script-path=cron.js,tag = cronScript,timeout = 300,argument = "1234",enable=true

network-changed script-path=https://raw.githubusercontent.com/Loon0x00/LoonExampleConfig/master/Script/netChanged.js,tag=changeModel,timeout = 300,argument = "1234",enable=true

generic script-path=https://raw.githubusercontent.com/Loon0x00/LoonExampleConfig/master/Script/generic_example.js,tag=GeoLocation,timeout=10,img-url=location.fill.viewfinder.system,timeout = 300,argument = "1234",enable=true
```

## 配置参数要点

- `script-path`：本地脚本文件名或远程脚本 URL。
- `tag`：脚本显示名称或标识。
- `requires-body=true`：仅在需要读取请求体或响应体时开启。
- `binary-body-mode=true`：需要以二进制形式读取 body 时开启，例如后续交给 `$utils.ungzip(...)` 处理。
- `timeout`：脚本执行超时设置。
- `argument`：传入脚本的参数，脚本内通过 `$argument` 获取。
- `enable`：是否启用该脚本配置。

## Script API

脚本运行环境中的对象、方法、回调参数和可执行 JavaScript 示例统一查阅 `references/script_api.md`，本文件不重复维护 API 示例。

## 使用提醒

- `cron` 需要正确的定时表达式。
- 异步回调、定时器与 `$done()` 的用法查阅 `references/script_api.md`。
