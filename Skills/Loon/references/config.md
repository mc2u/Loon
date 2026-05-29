# Loon 配置参考

这份文档用于整理常见配置结构、常用字段和其他配置相关内容，适合在写配置、改配置时快速查阅。

## 常见配置段

- 常规 `[General]`
- 节点 `[Proxy]`
- 远程节点 `[Remote Proxy]`
- 代理链 `[Proxy Chain]`
- 策略组 `[Proxy Group]`
- 远程筛选 `[Remote Filter]`
- 规则 `[Rule]`
- 远程规则 `[Remote Rule]`
- 复写 `[Rewrite]`
- 主机映射 `[Host]`
- 脚本 `[Script]`
- 远程脚本 `[Remote Script]`
- 插件 `[Plugin]`
- MitM `[MITM]`

## `常规 [General]` 常见字段

- `skip-proxy`
- `bypass-tun`
- `dns-server`
- `doh-server`
- `doq-server`
- `doh3-server`
- `allow-wifi-access`
- `wifi-access-http-port`
- `wifi-access-socks5-port`
- `proxy-test-url`
- `test-timeout`
- `resource-parser`
- `ssid-trigger`
- `real-ip`

## 完整 `[General]` 示例

```ini
[General]
bypass-tun = 192.168.0.0/16,localhost,*.local
skip-proxy = 192.168.0.0/16
dns-server = system,1.1.1.1
doh-server = https://doh.dns.apple.com/dns-query
doq-server = quic://example.com,quic://example2.com
doh3-server = h3://223.6.6.6/dns-query
allow-wifi-access = true
wifi-access-http-port = 8899
wifi-access-socks5-port = 8898
proxy-test-url = http://cp.cloudflare.com/generate_204
internet-test-url = http://wifi.vivo.com.cn/generate_204
test-timeout = 5
switch-node-after-failure-times = 2
resource-parser = https://github.com/sub-store-org/Sub-Store/releases/latest/download/sub-store-parser.loon.min.js
ssid-trigger = "loon-wifi5g":DIRECT,"cellular":PROXY,"default":RULE
real-ip = *.apple.com,*.icloud.com
hijack-dns = *:53,8.8.8.8
interface-mode = Performace
force-http-engine-hosts = *.baid.com,:8080
```

## 专项参考分工

以下配置段只在整体骨架中示意组合关系；语法、参数和专项示例统一查对应参考文件：

- 节点 `[Proxy]`、筛选节点 -> `references/node.md`
- 策略组 `[Proxy Group]` -> `references/policy.md`
- 规则 `[Rule]` -> `references/rule.md`
- DNS 与主机映射 `[Host]` -> `references/dns.md`
- 复写 `[Rewrite]` -> `references/rewrite.md`
- 脚本 `[Script]` -> `references/script.md`
- 资源解析器 -> `references/parser.md`
- 插件 -> `references/plugin.md`

## `MitM [MITM]` 常见字段

- `hostname`
- `skip-server-cert-verify`
- `ca-p12`
- `ca-passphrase`

## MitM 基本说明

MitM 一般需要：

1. 生成证书
2. 安装证书
3. 在系统中信任证书
4. 正确配置需要解密的域名

如果 MitM 没生效，常见检查项包括：

- 证书是否安装
- 证书是否信任
- 域名是否加入 MitM 范围
- 请求是否属于需要解密的 HTTPS 场景

## 完整 MitM 示例

```ini
[MITM]
hostname = *.example.com,*.sample.com
skip-server-cert-verify = true
#ca-p12 =
#ca-passphrase =
```

## 一个更完整的配置骨架示例

```ini
[General]
bypass-tun = 192.168.0.0/16,localhost,*.local
skip-proxy = 192.168.0.0/16
dns-server = system,1.1.1.1
proxy-test-url = http://cp.cloudflare.com/generate_204
test-timeout = 5

[Proxy]
ss1 = Shadowsocks,example.com,443,aes-128-gcm,"password",fast-open=false,udp=true

[Remote Proxy]
Subs = https://example/server-complete.txt

[Remote Filter]
HK = NameRegex,Subs,FilterKey = *HK

[Proxy Group]
PROXY = select,ss1,Subs
Auto = url-test,ss1,Subs,url = http://bing.com/generate_204,interval = 600

[Rule]
DOMAIN,google.com,PROXY
FINAL,DIRECT

[Host]
*.apple.com = server:system

[Rewrite]
^http://example.com 302 https://example.com

[Script]
cron "0 8 * * *" script-path=cron.js,tag=cronScript,timeout=300,enable=true

[MITM]
hostname = *.example.com
skip-server-cert-verify = true
```

## 资源解析器

解析器通过 `[General]` 里的 `resource-parser` 指定，仅用于订阅节点资源的处理；变量、返回格式与最小模板统一查阅 `references/parser.md`。

不要把解析器用于规则、复写、脚本或插件资源的通用预处理；这些内容应按各自配置段或插件语法处理。
