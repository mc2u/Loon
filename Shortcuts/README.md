# Shortcuts

这里存放与 Loon 配合使用的 Apple Shortcuts（快捷指令）。

## Loon 持久化数据查看

用于快速查看 Loon 脚本通过 `$persistentStore.write()` 持久化的数据，导出数据选择此快捷指令即可。

[导入快捷指令](https://www.icloud.com/shortcuts/437f764d3ddc4caf962e47a032f13e9a)

## Loon User-Agent 修改插件生成

用于根据订阅域名快速生成 Loon User-Agent 修改插件（`.lpx`）。

Loon 使用资源解析器拉取订阅时，会先使用 Loon 自身的 User-Agent 请求订阅内容，再由解析器使用设定的 User-Agent 重新拉取。遇到某些订阅服务只允许特定 User-Agent，或存在拉取速率限制时，首次请求可能会被拒绝，进而导致订阅无法拉取或解析器二次拉取失败。

这种情况下，可以通过复写直接修改订阅请求的 User-Agent。本快捷指令会根据输入的订阅链接生成对应的 Loon 插件。

- 自动提取订阅链接主机名，忽略路径与查询参数。
- 输出文件名为 `{域名}.lpx`。
- 自动保存并导入到 Loon，导入后需要手动点击安装插件按钮。

[导入快捷指令](https://www.icloud.com/shortcuts/19c9019bd4724dcb868e38c8bfb0fb81)
