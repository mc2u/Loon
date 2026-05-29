# Loon Scheme 参考

这份文档用于说明 Loon 的 Scheme 和统一链接相关用法。

官方页面：`https://nsloon.app/docs/Scheme/`

## 常见用途

Scheme 一般用于：

- 打开或关闭 VPN
- 切换流量模式或代理模式
- 跳转到配置编辑
- 导入配置、节点、规则、插件、图标、GeoIP、解析器
- 更新订阅资源

## Scheme 作用速查

| Scheme | 作用 |
|---|---|
| `loon://on` | 开启 VPN |
| `loon://off` | 关闭 VPN |
| `loon://editconfig` | 编辑配置文件 |
| `loon://flowmodel=direct` | 切换流量模式为全局直连 |
| `loon://flowmodel=filter` | 切换流量模式为分流 |
| `loon://flowmodel=proxy` | 切换流量模式为全局代理 |
| `loon://proxymode=tun` | 设置代理模式为 TUN Only |
| `loon://proxymode=mix` | 设置代理模式为 HTTP Proxy & TUN |
| `loon://import?sub=encode(url)` | 安装远端配置文件 |
| `loon://import?nodelist=encode(url)` | 导入订阅节点 |
| `loon://import?rules=encode(url)` | 导入订阅规则 |
| `loon://import?plugin=encode(url)` | 导入插件 |
| `loon://import?iconset=encode(url)` | 导入图标集 |
| `loon://import?geoip=encode(url)` | 导入 GeoIP 数据库 |
| `loon://import?parser=encode(url)` | 导入解析器 |
| `loon://update?sub=all` | 更新所有订阅资源 |

## 统一链接

统一链接用于在网页中点击后跳转到 Loon，对应上面的 Scheme。

```text
https://www.nsloon.com/openloon/on
https://www.nsloon.com/openloon/off
https://www.nsloon.com/openloon/editconfig
https://www.nsloon.com/openloon/flowmodel=direct
https://www.nsloon.com/openloon/flowmodel=filter
https://www.nsloon.com/openloon/flowmodel=proxy
https://www.nsloon.com/openloon/proxymode=tun
https://www.nsloon.com/openloon/proxymode=mix
https://www.nsloon.com/openloon/import?sub=encode(url)
https://www.nsloon.com/openloon/import?nodelist=encode(url)
https://www.nsloon.com/openloon/import?rules=encode(url)
https://www.nsloon.com/openloon/import?plugin=encode(url)
https://www.nsloon.com/openloon/import?iconset=encode(url)
https://www.nsloon.com/openloon/import?geoip=encode(url)
https://www.nsloon.com/openloon/import?parser=encode(url)
https://www.nsloon.com/openloon/update?sub=all
```

## 回答建议

当用户问 Scheme 时，优先说明：

1. 这是打开、关闭、跳转、切换模式、导入，还是更新资源。
2. 如果包含远程 URL，`encode(url)` 表示需要 URL 编码后的地址。
3. 需要用户手动点击，还是用于快捷指令 / 自动化。
4. 如果用户要在网页或文档中放链接，优先给统一链接；如果用户要在 Loon / 快捷指令中直接调用，可给 `loon://` Scheme。
