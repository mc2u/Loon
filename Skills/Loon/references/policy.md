# Loon 策略参考

这份文档用于整理 Loon 策略、内置策略、策略组及常见写法。

官方页面：

- 策略：`https://nsloon.app/docs/Policy/`
- 策略组：`https://nsloon.app/docs/Policy/policygroup`

## 策略的作用

Loon 的流量走向机制：

```text
手机请求 -> 匹配规则 -> 查询规则指定的策略 -> 根据策略获取相应节点
```

规则指向策略，策略决定使用哪个节点或策略组。

Loon 中策略可以是：

1. 一个节点
2. 内置策略
3. 策略组

## 节点类型策略

当策略是一个节点名时，表示使用这个节点转发。

```ini
# 假设已有节点名为 香港01
DOMAIN,google.com,香港01
```

## 内置策略

### DIRECT

直连，不经过代理服务器。

```ini
DOMAIN,apple.com,DIRECT
```

### REJECT 类

用于拒绝请求，常用于去广告。

| 策略 | 行为 |
|---|---|
| `REJECT` | HTTP 404，响应体为空 |
| `REJECT-DROP` | 丢弃请求，不返回响应 |
| `REJECT-NO-DROP` | HTTP 404，响应体为空，不会升级到 `REJECT-DROP` |
| `REJECT-IMG` | HTTP 200，响应体为 1 像素 GIF |
| `REJECT-IMG-NO-DROP` | HTTP 200，响应体为 1 像素 GIF，不会升级到 `REJECT-DROP` |
| `REJECT-VIDEO` | HTTP 200，响应体为空白视频 |
| `REJECT-VIDEO-NO-DROP` | HTTP 200，响应体为空白视频，不会升级到 `REJECT-DROP` |
| `REJECT-DICT` | HTTP 200，响应体为空 JSON 对象 |
| `REJECT-DICT-NO-DROP` | HTTP 200，响应体为空 JSON 对象，不会升级到 `REJECT-DROP` |
| `REJECT-ARRAY` | HTTP 200，响应体为空 JSON 数组 |
| `REJECT-ARRAY-NO-DROP` | HTTP 200，响应体为空 JSON 数组，不会升级到 `REJECT-DROP` |

注意：响应体类的 `REJECT-*` 需要能够处理 HTTP 内容，仅适用于 HTTP 或已解密的 HTTPS 请求；未解密 HTTPS / TCP 层流量无法返回图片、视频或 JSON 响应体。

## 策略组 `[Proxy Group]`

策略组是一系列策略、策略组的集合，可以手动或自动决定使用其中哪一个策略。策略组可以互相嵌套。

常见策略组类型：

- `select`
- `url-test`
- `fallback`
- `load-balance`
- `ssid`（常见配置中用于按网络环境选择策略）

## select 策略组

手动选择策略。

```ini
[Proxy Group]
PROXY = select,DIRECT,香港01,美国01,Auto
```

## url-test 策略组

定期对策略组下所有节点测速，选择最快节点。

常见参数：

- `url`：测速 URL，Loon 会向该 URL 发起 header 请求
- `interval`：测速间隔，单位秒
- `tolerance`：容差，单位毫秒；新最优节点与旧最优节点差距小于该值时不切换

```ini
[Proxy Group]
Auto = url-test,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,tolerance = 50
```

## fallback 策略组

定期测速，选择第一个可用节点。

常见参数：

- `url`：测速 URL
- `interval`：测速间隔，单位秒
- `max-timeout`：最大超时时间，单位毫秒；超过该值视为不可用

```ini
[Proxy Group]
Fallback = fallback,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,max-timeout = 3000
```

## load-balance 策略组

负载均衡，根据算法自动选择子策略。

常见参数：

- `url`：测速 URL
- `interval`：测速间隔，单位秒
- `max-timeout`：最大超时时间，单位毫秒
- `algorithm`：负载均衡算法

官方说明的算法：

- `Random`：随机选择子策略
- `PCC`：基于 Random，相同主机名请求锁定同一节点
- `Round-Robin`：轮询选择子策略

```ini
[Proxy Group]
LoadBalance = load-balance,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,max-timeout = 3000,algorithm = PCC
```

## ssid 策略组

按网络环境选择策略，常用于 Wi-Fi / 蜂窝网络切换。

```ini
[Proxy Group]
WiFi = ssid, default = PROXY, cellular = DIRECT, "Home WiFi" = DIRECT
```

## 完整示例

```ini
[Proxy]
香港01 = Shadowsocks,example.com,443,aes-128-gcm,"password",fast-open=false,udp=true
美国01 = Shadowsocks,example.org,443,aes-128-gcm,"password",fast-open=false,udp=true

[Proxy Group]
PROXY = select,DIRECT,香港01,美国01,Auto,Fallback,LoadBalance
Auto = url-test,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,tolerance = 50
Fallback = fallback,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,max-timeout = 3000
LoadBalance = load-balance,香港01,美国01,url = http://cp.cloudflare.com/generate_204,interval = 600,max-timeout = 3000,algorithm = PCC
WiFi = ssid, default = PROXY, cellular = DIRECT, "Home WiFi" = DIRECT

[Rule]
DOMAIN-SUFFIX,google.com,PROXY
DOMAIN-SUFFIX,apple.com,DIRECT
FINAL,PROXY
```

## 回答建议

当用户问策略或策略组时：

1. 先确认规则要指向的是节点、内置策略还是策略组。
2. 策略组中的节点名、远程订阅名、筛选名必须真实存在。
3. `select` 适合手动切换；`url-test` 适合自动选最快；`fallback` 适合故障切换；`load-balance` 适合分散请求；`ssid` 适合按网络环境切换。
4. 规则依赖策略名，生成 `[Rule]` 前要确保 `[Proxy Group]` 或 `[Proxy]` 中存在对应名称。
