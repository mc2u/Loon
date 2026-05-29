# Loon DNS 参考

这份文档用于整理 Loon DNS 与 DNS 映射相关配置。

官方页面：

- DNS：`https://nsloon.app/docs/DNS/`
- DNS 映射：`https://nsloon.app/docs/DNS/hostmap`

## 支持的 DNS 查询类型

Loon 支持：

- 标准 UDP DNS 查询
- DNS-over-HTTPS（DoH）
- DNS-over-QUIC（DoQ）
- DNS-over-HTTP3（DoH3）

## `[General]` 中的 DNS 配置

```ini
[General]
# system 表示系统自带 DNS 服务器
dns-server = system,119.29.29.29,223.5.5.5

# DoH server：标准 URL 格式，多个地址用英文逗号分隔
doh-server = https://example.com/dns-query

# DoQ server：以 quic:// 开头，默认端口 784
doq-server = quic://example.com:784

# DoH3 server：以 h3:// 开头
doh3-server = h3://example.com/dns-query
```

## DNS 查询逻辑

- Loon 将 DNS 查询分为常规 DNS 查询与加密 DNS 查询（DoH / DoQ / DoH3）。
- 同时配置加密 DNS 与常规 DNS 时，优先进行加密 DNS 查询。
- 对多个有效 DNS 服务器会并发查询，使用响应最快的结果。
- 使用加密 DNS 查询失败时，可回落到常规 DNS；该回落行为可在 App 的 DNS 服务器页面关闭。

## DNS 映射 / `[Host]`

DNS 映射用于给特定域名指定 DNS 服务器、固定 IP 或 IP 模式，通常写在 `[Host]` 段。

支持模式：

1. 域名映射到另一个域名。
2. 域名映射到固定 IP。
3. 指定某个域名使用特定 DNS 服务器查询。
4. 特定 SSID 环境下指定 DNS 服务器。
5. 域名指定 IP 模式。

## `[Host]` 示例

```ini
[Host]
# 域名映射到固定 IP
example.com = 192.168.1.20

# 域名映射到另一个域名
example.com = example.com.cn

# 指定域名使用指定 DNS 服务器
*.testflight.apple.com = server:8.8.4.4

# system 表示系统 DNS 服务器
*.apple.com = server:system

# 特定 SSID 环境下指定 DNS 查询服务器
ssid:LOON WIFI = server:https://example.com/dns-query

# 指定域名 IP 模式
example.com = ip-mode:ipv4-ony
```

## IP 模式

官方 DNS 映射页面给出的可选 IP 模式包括：

- `ipv4-ony`（官方文档原文如此；生成配置前可结合当前 Loon 版本核对是否应为 `ipv4-only`）
- `dual`
- `ipv4-preferred`
- `ipv6-preferred`

具体含义参考 `[General]` 中的 `ip-mode` 说明。

## 回答建议

当用户问 DNS / Host / 映射时：

1. 先判断是全局 DNS 服务器配置，还是特定域名映射。
2. 全局 DNS 写 `[General]` 的 `dns-server` / `doh-server` / `doq-server` / `doh3-server`。
3. 域名固定 IP、指定 DNS、SSID DNS、IP 模式写 `[Host]`。
4. 不要把 DNS 映射写成分流规则；DNS 映射改变解析，规则决定流量策略。
5. 用户要排查解析问题时，优先检查是否同时配置加密 DNS、是否有 Host 覆盖、是否存在 SSID 特定规则。
