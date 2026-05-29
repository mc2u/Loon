# Loon Script API 参考

这份文档单独整理 Script API 页面相关内容，适合查询脚本环境中的常用接口和示例。

> 如果要查脚本类型、脚本配置和触发方式，请看 `references/script.md`。

## 基础 API

### `console.log()`

用于打印内容，参数可以是任意类型。

## 定时器

### `setTimeout(callback, mis, ...vars)`

作用：

- 在指定毫秒数后执行回调
- 这是异步方法，不会阻塞当前逻辑

使用时要注意：

- 如果脚本需要等待 `setTimeout` 里的逻辑完成，应该在回调里再调用 `$done()`
- 如果在 `setTimeout` 之后立刻调用 `$done()`，脚本环境会提前释放，定时器中的逻辑可能不会执行

示例：

```javascript
setTimeout(function() {
  console.log("hello world");
  $done();
}, 1000);
```

## 基本信息

### `$loon`

表示当前 Loon 的基础信息。

可用内容包括：

- 设备名称
- 系统版本
- App 版本
- Build 版本

### `$script`

表示当前脚本本身的信息。

常见字段：

- `$script.name`：当前执行的脚本名称
- `$script.startTime`：脚本开始执行的时间

### `$config`

用于读取和修改当前配置相关信息。

#### `$config.getConfig()`

获取当前配置信息，返回 JSON 字符串。

返回内容里常见会包括：

- 当前运行模式
- 内置节点
- 全局策略
- 所有策略组
- 当前 SSID
- Final 策略
- 各策略组当前选择结果

官方示例：

```json
{
   "running_model": 1,
   "all_buildin_nodes": [
       "DIRECT",
       "REJECT"
   ],
   "global_proxy": "节点选择",
   "all_policy_groups": [
       "宝贝支付",
       "奈飞影视",
       "运营劫持",
       "负载均衡",
       "全球直连",
       "国内媒体",
       "HK",
       "广告拦截",
       "漏网之鱼",
       "WiFi",
       "节点选择",
       "JP",
       "苹果服务",
       "测速",
       "健康模式",
       "BliBliArea",
       "TW",
       "谷歌服务",
       "油管视频",
       "国外网站",
       "网易解锁"
   ],
   "ssid": "loon-wifi-5g",
   "final": "节点选择"
}
```

#### `$config.getConfig(policyName, selectName)`

设置某个策略组当前所选策略。

- `policyName`：策略组名称
- `selectName`：目标策略名称
- 成功返回 `true`
- 失败返回 `false`

#### `$config.getSubPolicies(policyName, function(subPolicies){})`

获取某个策略组的所有子策略。

- 获取成功后通过回调返回
- `subPolicies` 为字符串数组

#### `$config.getSelectedPolicy(policyName)`

返回某个策略组当前选中的子策略名称。

#### `$config.setRunningModel(model)`

设置当前运行模式。

- `0`：全局直连
- `1`：分流模式
- `2`：全局代理

## 本地存储

### `$persistentStore.write(value, [key])`

把 `value` 以 `key` 为键存储到本地。

- `value` 和 `key` 都是字符串
- 如果不传 `key`，默认使用当前脚本名字的 hash 值
- 成功返回 `true`
- 失败返回 `false`

### `$persistentStore.read([key])`

读取本地保存的值。

- 如果不传 `key`，默认使用当前脚本名字的 hash 值
- 返回对应的字符串值

### `$persistentStore.remove()`

清除所有通过脚本 API 保存在本地的数据。

示例：

```javascript
$persistentStore.write('loon', 'appNameKey')
let res = $persistentStore.read('appNameKey')
console.log(res)
$persistentStore.remove()
```

## 通知

### `$notification.post(title, subtitle, content, attach = null, delay = 0)`

用于发送 iOS 本地通知。

参数：

- `title`：标题
- `subtitle`：副标题
- `content`：通知内容
- `attach`：可选附件或跳转信息
- `delay`：延迟多少毫秒后发出通知

### attach 为字符串时

表示点击通知后的跳转链接：

```javascript
$notification.post("title","subtitle","content","loon://switch")
```

### attach 为对象时

既可以支持附件，也可以支持点击跳转：

```javascript
var attach = {
  "openUrl":"loon://switch",
  "mediaUrl":"https://example.com/img",
  "clipboard":"tap to copy"
}
$notification.post("title","subtitle","content",attach)
```

其中：

- `openUrl`：点击通知后的跳转链接
- `mediaUrl`：通知附件，如图片或视频 URL
- `clipboard`：点击通知进入 Loon 后复制到剪切板的内容

## 网络请求

### `$httpClient.get(params, function(errormsg, response, data){})`

用于发起 GET 请求。

### `$httpClient.post(params, function(errormsg, response, data){})`
### `$httpClient.head(params, function(errormsg, response, data){})`
### `$httpClient.delete(params, function(errormsg, response, data){})`
### `$httpClient.put(params, function(errormsg, response, data){})`
### `$httpClient.options(params, function(errormsg, response, data){})`
### `$httpClient.patch(params, function(errormsg, response, data){})`

这些方法的参数和回调形式与 `get` 基本一致。

### `params` 常见字段

```javascript
const params = {
  url: "https://example.com/",
  timeout: 2000,
  headers: {
    "Content-Type": "application/json"
  },
  body: "{}",
  "body-base64": true,
  node: "HK - v1.0",
  "binary-mode": true,
  "auto-redirect": false,
  "auto-cookie": false,
  alpn: "h2"
}
```

字段说明：

- `url`：请求地址
- `timeout`：超时时间，单位毫秒，默认 5000ms
- `headers`：请求头
- `body`：请求体，主要用于 POST 等方法
- `body-base64`：把 `body` 按 base64 二进制解析
- `node`：指定请求使用的节点或策略组
- `binary-mode`：让响应 body 按二进制返回
- `auto-redirect`：是否自动处理重定向
- `auto-cookie`：是否自动存储和携带 Cookie
- `alpn`：HTTP 请求方式，目前常见 `h1` 和 `h2`

### `$httpClient` 回调参数

回调函数签名示例：

```javascript
function callback(errormsg, response, data) {}
```

说明：

- `errormsg`：失败原因，请求成功时通常为 `null`
- `response`：响应对象
- `data`：响应 body

响应对象常见结构：

```javascript
const response = {
  status: 200,
  headers: {
    "content-length": 200
  },
  h2_trailers: {
    "grpc-status": 0
  }
}
```

## 工具

### `$utils.geoip(ipStr)`

查询 IP 地址对应的 GEOIP，结果通常为 ISO 3166 code。

### `$utils.ipasn(ipStr)`

查询 IP 地址对应的 ASN。

### `$utils.ipaso(ipStr)`

查询 IP 地址对应的 ASO。

### `$utils.ungzip(binary)`

解压 gzip 的二进制数据，返回解压后的二进制结果。

示例：

```javascript
// binaryData 应为 gzip 二进制数据，例如开启 binary-mode 后拿到的 Uint8Array。
let plainBinary = $utils.ungzip(binaryData)
```

注意：`$utils.ungzip` 接收的是 gzip 二进制数据，不是 base64 字符串；如果响应不是二进制 gzip 数据，不要套用这个方法。

## 其他

### `$done()`

作用：

- 表示脚本处理完成
- 在异步场景中应当在真正完成后再调用

### `$environment`

仅用于 `generic` 类型脚本。

常见字段：

- `$environment.params.node`：节点名称
- `$environment.params.nodeInfo`：节点简洁信息

## 完整示例

```javascript
console.log('This is a log');

var params = {
  url: "https://api.example.com/post",
  headers: {
    Host: "api.example.com",
    "Content-Type": "application/json",
  },
  body: "string"
}

$httpClient.get('https://example.com/index', function(error, response, data) {
  console.log(response);
});

$httpClient.get(params, function(error, response, data) {
  console.log(response);
});

$httpClient.post(params, function(error, response, data) {
  console.log(response);
});

$notification.post('title', 'subtitle', 'body')

$persistentStore.write('loon', 'appNameKey')
let res = $persistentStore.read('appNameKey')
console.log(res)
$persistentStore.remove()

let ipaso = $utils.ipaso("43.153.80.208");
console.log(ipaso);

let geoip = $utils.geoip("43.153.80.208");
console.log(geoip);

let ipasn = $utils.ipasn("43.153.80.208");
console.log(ipasn);

// $utils.ungzip(binaryUint8Array) 用于解压 gzip 二进制数据；不要直接把 base64 字符串传入。

setTimeout(function() {
  console.log('This code executes after 1 second');
}, 1000);

setTimeout(function(text) {
  console.log('This code executes after 5 seconds');
  console.log(text);
  $done()
}, 5000, 'This is a parameter passed to the function');
```
