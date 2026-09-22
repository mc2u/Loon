// 节点助手：把插件参数里填入的节点链接通过 http://nodes.loon 吐出去
// 只支持明文 URI 行（vless:// anytls:// ss:// vmess:// 等），一行一个
// 不含任何联网抓取，不做协议转换
// 搭配 Plugins/loon_nodes.lpx 使用

function str(v) {
  return v == null ? "" : String(v);
}

function logEvent(level, stage, message) {
  console.log("[节点助手][" + level + "][" + stage + "] " +
    str(message).replace(/[\r\n\t\u0000-\u001F\u007F]+/g, " ").trim().slice(0, 500));
}

// 取参数：兼容 object 与 argument="key=value&..." 字符串两种形式
function readField(arg, keys) {
  var raw = "";
  if (typeof arg === "string") {
    for (var i = 0; i < keys.length; i++) {
      var m = new RegExp("(?:^|&)" + keys[i] + "=([^&]*)").exec(arg);
      if (m) {
        try { raw = decodeURIComponent(m[1]); } catch (e) { raw = m[1]; }
        if (raw) return raw;
      }
    }
  } else if (arg && typeof arg === "object") {
    for (var j = 0; j < keys.length; j++) {
      if (arg[keys[j]]) { raw = str(arg[keys[j]]); break; }
    }
  }
  return raw;
}

function readNodes(arg) {
  return readField(arg, ["importNodes", "import", "nodes", "node", "list"]);
}

// 是否节点 URI 行：带 scheme://，且排除 http(s) 链接（那是订阅，不是节点）
function isNodeUri(line) {
  return /^\w+:\/\//.test(line) && !/^https?:\/\//i.test(line);
}

// 按行切分并裁剪首尾空白，去掉空行与完全重复的行，顺序保持
function splitLines(raw) {
  var parts = str(raw).split(/\r\n|\r|\n/);
  var out = [];
  var seen = {};
  for (var i = 0; i < parts.length; i++) {
    var line = parts[i].replace(/^\s+|\s+$/g, "");
    if (!line || seen[line]) continue;
    seen[line] = 1;
    out.push(line);
  }
  return out;
}

// 从一段文本里取出节点链接，非 URI 行一律忽略
function extractUris(chunk) {
  var lines = splitLines(chunk);
  var nodes = [];
  for (var i = 0; i < lines.length; i++) {
    if (isNodeUri(lines[i])) nodes.push(lines[i]);
  }
  return nodes;
}

(function main() {
  var rawNodes = "";
  try {
    rawNodes = readNodes(typeof $argument !== "undefined" ? $argument : null);
  } catch (e) {
    rawNodes = "";
  }
  var nodes = extractUris(rawNodes);
  if (!nodes.length) {
    logEvent("INFO", "导入", "节点=0，请在插件设置中填写导入节点");
    $done({ response: {
      status: 404,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: "# 节点助手：没有可用节点，请在插件设置中填写导入节点\n"
    } });
    return;
  }
  logEvent("INFO", "导入", "节点=" + nodes.length);
  $done({ response: {
    status: 200,
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      "Content-Disposition": "attachment; filename=\"nodes\"; filename*=UTF-8''" +
        encodeURIComponent("节点助手")
    },
    body: nodes.join("\n") + "\n"
  } });
})();
