/**
 * 示例脚本  node_sub_example.js
 * ------------------------------------------------------------------
 * 演示一条完整链路：
 *   脚本获取节点  ->  写入 $persistentStore  ->  作为 Loon 订阅被导入
 *
 * 作者：mc2u[https://github.com/mc2u], 吃白饭的大肥鱼[https://www.deepseek.com]
 ------------------------------------------------------------------
 */

var STORE_KEY = "node_sub_example";

function str(v) { return v == null ? "" : String(v); }

function log(msg) {
  console.log("[节点订阅示例] " + str(msg).replace(/[\r\n\t\u0000-\u001F\u007F]+/g, " ").trim().slice(0, 500));
}

/* ================= 1. HTTP 封装 ================= */
var TIMEOUT = 20000;

function httpGet(url, cb) {
  $httpClient.get({ url: url, timeout: TIMEOUT }, function (err, resp, data) {
    if (err) { cb(err); return; }
    cb(null, str(data));
  });
}

/* ================= 2. 存储 ================= */
// 取节点成功才写；失败时用上次的结果兜底，避免订阅被拉空
function saveNodes(text) {
  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
      $persistentStore.write(text, STORE_KEY);
    }
  } catch (e) {}
}

function loadNodes() {
  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
      return str($persistentStore.read(STORE_KEY));
    }
  } catch (e) {}
  return "";
}

/* ================= 3. 节点来源 =================
 * 契约：实现下面这一个 fetchNodes(done)
 *   成功    -> done([ "vless://...", "ss://...", ... ])   字符串数组，每项一条节点 URI
 *   无数据  -> done([])
 *   出错    -> done(null)                                 会走第 5 段的缓存兜底
 */

function fetchNodes(done) {
  done(null);
}

/* ================= 4. 去重 & 输出订阅 ================= */
function uniqueLines(text) {
  var parts = str(text).split(/\r\n|\r|\n/);
  var out = [], seen = {};
  for (var i = 0; i < parts.length; i++) {
    var line = parts[i].replace(/^\s+|\s+$/g, "");
    if (!line || seen[line]) continue;
    seen[line] = 1;
    out.push(line);
  }
  return out;
}

function respond(nodes) {
  if (!nodes.length) {
    log("没有可用节点，订阅返回 404");
    $done({ response: {
      status: 404,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: "# 没有可用节点\n"
    } });
    return;
  }
  log("返回节点=" + nodes.length);
  $done({ response: {
    status: 200,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: nodes.join("\n") + "\n"
  } });
}

/* ================= 5. 主流程 ================= */
(function main() {
  log("开始获取节点");
  fetchNodes(function (nodes) {
    var list = nodes ? uniqueLines(nodes.join("\n")) : [];
    if (list.length) {
      saveNodes(list.join("\n"));      // 存起来，供下次获取失败时兜底
      log("获取成功，共 " + list.length + " 条");
      respond(list);
    } else {
      var last = uniqueLines(loadNodes());
      log("获取失败" + (last.length ? "，沿用上次的 " + last.length + " 条" : "，且无历史缓存"));
      respond(last);
    }
  });
})();
