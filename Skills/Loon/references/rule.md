# Loon 规则参考

这份文档用于整理 Loon 的规则分类、常见写法、优先级和完整示例。

## Loon 分流规则文件后缀

- `.lsr`：Loon Shunt Rules，Loon 分流规则。
- 当只保存规则列表或远程分流规则资源时，优先使用 `.lsr` 后缀。

## 规则总览

规则决定流量使用哪个策略。

常见原则：

- 本地规则优先级高于插件中的规则
- 插件中的规则优先级高于订阅规则
- 没有匹配到规则时会使用 Final
- `URL-REGEX` 一般会在其他规则未命中时再参与匹配

## 常见规则类型

- `DOMAIN-SUFFIX`
- `DOMAIN`
- `DOMAIN-KEYWORD`
- `USER-AGENT`
- `URL-REGEX`
- `IP-CIDR`
- `IP-CIDR6`
- `GEOIP`
- `IP-ASN`
- `SRC-PORT`
- `DEST-PORT`
- `PROTOCOL`
- 逻辑规则：`AND` / `OR` / `NOT`

## 规则目标策略

规则最后一个字段指向目标策略，例如节点名、策略组名或 `DIRECT` / `REJECT` 类内置策略。内置策略与 Reject 行为说明统一查阅 `references/policy.md`。

示例：

```ini
DOMAIN-SUFFIX,example.com,PROXY
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-SUFFIX,ads.example.com,REJECT
```

## 域名类规则

适合处理：

- 指定域名
- 指定域名后缀
- 指定域名关键词

完整示例：

```ini
DOMAIN,google.com,PROXY
DOMAIN-SUFFIX,apple.com,PROXY
DOMAIN-KEYWORD,apple,PROXY
```

## IP 类规则

适合处理：

- 指定 IP
- 指定 IPv6
- 按国家地区匹配
- 按 ASN 匹配

完整示例：

```ini
IP-CIDR,118.89.204.198/32,no-resolve
IP-CIDR6,2402:4e00:1200:ed00:0:9089:6dac:96b6/128
GEOIP,CN,DIRECT
IP-ASN,4134,DIRECT,no-resolve
```

关于 `no-resolve`：

- 只对目标地址本身就是 IP 的请求生效
- 不会为了匹配这条规则再去做 DNS 解析

## HTTP 类规则

适合根据请求特征进行匹配。

完整示例：

```ini
URL-REGEX,^http://google\.com,PROXY
USER-AGENT,Apple*,DIRECT
```

## 逻辑规则

逻辑规则用于把多个规则组合成一个规则。

完整示例：

```ini
AND,((DOMAIN-SUFFIX,axample),(DEST-PORT,443),(GEOIP,CN)),DIRECT
OR,((DOMAIN-SUFFIX,axample),(DEST-PORT,443),(GEOIP,CN,no-resolve)),DIRECT
NOT,((AND,((DOMAIN-SUFFIX,axample),(DEST-PORT,443),(GEOIP,CN)))),DIRECT
```

使用时注意：

- AND / OR 一般需要至少两个子规则
- NOT 一般只针对一个子规则
- 混合域名和 IP 子规则时，通常把 IP 相关子规则放后面，减少不必要的 DNS 查询

## 端口规则

完整示例：

```ini
SRC-PORT,443,DIRECT
SRC-PORT,80-443,DIRECT
SRC-PORT,>=443,DIRECT
DEST-PORT,443,DIRECT
DEST-PORT,80-443,DIRECT
DEST-PORT,>=443,DIRECT
```

## 协议类规则

完整示例：

```ini
PROTOCOL,STUN,REJECT
```

支持的协议类型可参考官方文档中的说明，例如 HTTP / HTTPS / TCP / QUIC / STUN / UDP。

## 订阅规则

适合：

- 用远程规则列表统一维护规则
- 降低本地手写规则的数量
- 配合策略组统一管理

完整示例：

```ini
https://raw.githubusercontent.com/Loon0x00/LoonExampleConfig/master/Rule/ExampleRule.list, PROXY
```

## Final

Final 是兜底规则，当前面的规则都没有命中时，走 Final 指定的策略。

完整示例：

```ini
FINAL,DIRECT
FINAL,PROXY
```

## 一个更完整的规则段示例

```ini
[Rule]
DOMAIN,google.com,PROXY
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-KEYWORD,telegram,PROXY
IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
GEOIP,CN,DIRECT
USER-AGENT,Apple*,DIRECT
DEST-PORT,443,PROXY
PROTOCOL,STUN,REJECT
FINAL,PROXY
```

## 使用建议

- 先写明确规则，再写 Final
- Final 一般放在最后
- 规则依赖策略名，策略名必须真实存在
- 除 `REJECT` 外，其他 `REJECT-*` 类型不要用于普通域名/IP/TCP 层拦截；只有确认是 HTTP 或已解密 HTTPS 请求时才使用，例如可匹配到完整 URL 的 `URL-REGEX` 场景
- 如果问题是“为什么没命中”，优先检查规则顺序、规则类型和策略名
