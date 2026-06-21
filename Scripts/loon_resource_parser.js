/**
 * $resourceType: 解析器脚本自带全局变量，资源类型，枚举，详见下方
 * $resource: 解析器脚本自带全局变量，资源内容，string
 * $resourceUrl: 解析器脚本自带全局变量，资源url，string
 *
 * 资源类型
 * 0:config
 * 1:nodes
 * 2:rules
 * 3:rewrites
 * 4:scripts
 * 5:plugin
 *
 * Author: mc2u
 * Repository: https://github.com/mc2u/Loon
 *
 * 功能：
 * - 添加节点名前缀 / 后缀
 * - 去除节点名中的 Emoji
 * - 普通文本替换
 * - 按关键词自定义节点排序
 * - 开启 `ua` 时使用自定义 User-Agent 重新请求原始订阅
 *
 * 参数来源：
 * - 解析器插件 `[Argument]`
 * - 每次执行只使用本次插件设置传入的参数
 * - 如果 Loon 未调用解析器脚本，则脚本内任何参数和逻辑都不会执行
 */

var type = $resourceType;
var pre = "";
var suf = "";
var emoji = false;
var rename = "";
var sort = "";
var ua = false;
var userAgent = "";

function str(v) {
  return v == null ? "" : String(v);
}

function bool(v) {
  if (v === true) return true;
  var s = str(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function normalizeText(s) {
  s = str(s);
  if (s && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function cleanEmoji(text) {
  return str(text)
    .replace(/[\u{1F1E0}-\u{1F1FF}]|[\u{1F300}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

var renamePairs = [];

function parseRename() {
  renamePairs = [];
  if (!rename) return;
  var items = str(rename).split(",");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item) continue;
    var idx = item.indexOf(":");
    if (idx === -1) continue;
    var from = item.slice(0, idx).trim();
    var to = item.slice(idx + 1).trim();
    if (from) renamePairs.push([from, to]);
  }
}

function applyRename(name) {
  var n = str(name);
  for (var i = 0; i < renamePairs.length; i++) {
    n = n.split(renamePairs[i][0]).join(renamePairs[i][1]);
  }
  return n;
}

var sortKeywords = [];
var hasSort = false;

function parseSort() {
  sortKeywords = [];
  hasSort = false;
  if (!sort) return;
  var items = str(sort).split(",");
  for (var i = 0; i < items.length; i++) {
    var kw = items[i].trim();
    if (kw) sortKeywords.push(kw);
  }
  hasSort = sortKeywords.length > 0;
}

function getSortIndex(name) {
  if (!hasSort) return -1;
  var n = str(name);
  for (var i = 0; i < sortKeywords.length; i++) {
    if (n.indexOf(sortKeywords[i]) !== -1) return i;
  }
  return sortKeywords.length;
}

function sortItemsByName(items) {
  if (!hasSort || !items.length) return items;
  items.sort(function(a, b) {
    var ai = getSortIndex(a.name);
    var bi = getSortIndex(b.name);
    if (ai !== bi) return ai - bi;
    return a.index - b.index;
  });
  return items;
}

function modifyName(name) {
  var n = str(name);
  if (emoji) n = cleanEmoji(n);
  if (rename) n = applyRename(n);
  if (pre) n = pre + n;
  if (suf) n = n + suf;
  return n;
}

function base64DecodeUnicode(s) {
  try {
    var binary = atob(s);
    var bytes = [];
    for (var i = 0; i < binary.length; i++) {
      bytes.push("%" + ("00" + binary.charCodeAt(i).toString(16)).slice(-2));
    }
    return decodeURIComponent(bytes.join(""));
  } catch (e) { return null; }
}

function base64EncodeUnicode(s) {
  try {
    var enc = encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, function(m, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    });
    return btoa(enc);
  } catch (e) { return null; }
}

function looksLikeBase64(text) {
  var s = str(text).replace(/\s+/g, "");
  if (!s || s.length < 16) return false;
  if (s.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/=]+$/.test(s);
}

function processLoonStyle(text) {
  var raw = str(text);
  if (!raw) return "";
  var lines = raw.split("\n");
  var output = [];
  var items = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === "#") { output.push(line); continue; }
    var eqPos = line.indexOf("=");
    if (eqPos > 0) {
      items.push({
        index: items.length,
        name: modifyName(line.substring(0, eqPos).trim()),
        value: line.substring(eqPos + 1).trim()
      });
      continue;
    }
    output.push(line);
  }
  items = sortItemsByName(items);
  for (var j = 0; j < items.length; j++) {
    output.push(items[j].name + "=" + items[j].value);
  }
  console.log("[解析器] 已修改节点数: " + items.length);
  return output.join("\n");
}

function processBase64UriList(text) {
  var compact = str(text).replace(/\s+/g, "");
  var decoded = base64DecodeUnicode(compact);
  if (!decoded) return null;
  var lines = normalizeText(decoded).split("\n");
  var sortable = [];
  var passthrough = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var hashPos = line.lastIndexOf("#");
    if (hashPos > -1 && hashPos < line.length - 1) {
      var left = line.slice(0, hashPos + 1);
      var frag = line.slice(hashPos + 1);
      var oldName = "";
      try { oldName = decodeURIComponent(frag); } catch (e) { oldName = frag; }
      sortable.push({ index: sortable.length, name: modifyName(oldName), left: left });
    } else {
      passthrough.push({ raw: line });
    }
  }
  sortable = sortItemsByName(sortable);
  var merged = sortable.concat(passthrough);
  var output = [];
  for (var k = 0; k < merged.length; k++) {
    output.push(merged[k].left
      ? merged[k].left + encodeURIComponent(merged[k].name)
      : merged[k].raw);
  }
  var encoded = base64EncodeUnicode(output.join("\n"));
  if (!encoded) return null;
  console.log("[解析器] 已修改节点数: " + sortable.length);
  return encoded;
}

function processResource(content) {
  var raw = normalizeText(content);
  var configParts = [];
  if (ua) configParts.push("ua");
  if (emoji) configParts.push("emoji");
  if (rename) configParts.push("rename=" + rename);
  if (pre) configParts.push("pre=" + pre);
  if (suf) configParts.push("suf=" + suf);
  if (sort) configParts.push("sort=" + sort);
  console.log("[解析器] 当前配置: " + (configParts.length ? configParts.join(", ") : "无"));
  console.log("[解析器] 订阅内容长度: " + raw.length);
  var trimmed = raw.trim();
  if (!trimmed) return "";
  if (looksLikeBase64(trimmed)) {
    var base64Result = processBase64UriList(trimmed);
    if (base64Result !== null) return base64Result;
  }
  return processLoonStyle(trimmed);
}

function refetchWithUserAgent() {
  if (typeof $httpClient === "undefined" || !$httpClient) {
    console.log("[解析器] 当前环境不支持自定义 UA 拉取，已回退默认内容");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  if (typeof $resourceUrl === "undefined" || !$resourceUrl) {
    console.log("[解析器] 缺少资源地址，已回退默认内容");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  var req = {
    url: String($resourceUrl),
    headers: {
      "User-Agent": userAgent,
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Cache-Control": "no-cache",
      "Priority": "u=3"
    },
    alpn: "h2"
  };
  console.log("[解析器] 已启用自定义 UA: " + userAgent);
  $httpClient.get(req, function(error, response, data) {
    if (error || !data) {
      console.log("[解析器] 自定义 UA 拉取失败，已回退默认内容");
      finish(typeof $resource !== "undefined" ? $resource : "");
      return;
    }
    console.log("[解析器] 自定义 UA 拉取成功");
    finish(data);
  });
}

var typeName = { 0: "config", 1: "nodes", 2: "rules", 3: "rewrites", 4: "scripts", 5: "plugin" };

function finish(content) {
  console.log("[解析器] 资源类型: " + (typeName[type] || type));
  var result = type === 1 ? processResource(content) : str(content);
  console.log("[解析器] 处理完成");
  $done(result);
}

(function init() {
  var arg = typeof $argument !== "undefined" ? $argument : null;
  if (arg && typeof arg === "object") {
    if (arg.pre !== undefined) pre = str(arg.pre);
    if (arg.suf !== undefined) suf = str(arg.suf);
    if (arg.emoji !== undefined) emoji = bool(arg.emoji);
    if (arg.rename !== undefined) rename = str(arg.rename);
    if (arg.sort !== undefined) sort = str(arg.sort);
    if (arg.ua !== undefined) ua = bool(arg.ua);
    if (arg.userAgent !== undefined) userAgent = str(arg.userAgent);
  }
  parseRename();
  parseSort();
  console.log("[解析器] 已读取插件参数");
  if (ua && type === 1) refetchWithUserAgent();
  else finish(typeof $resource !== "undefined" ? $resource : "");
})();
