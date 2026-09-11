# LuCI 与 Mihomo Controller API 详解

## 三层调用关系

```text
浏览器中的 LuCI 页面
  ↓ RPC / ubus
LuCI ACL：限制 UCI、上传与可执行脚本权限
  ↓
/usr/libexec/minimihomo/api
  ↓ curl 127.0.0.1:9090
Mihomo Controller REST API
```

LuCI 页面的 API 请求由路由器本机转发到 `127.0.0.1:9090`；因此即使浏览器在另一台设备，也不会把 Controller 访问权限直接交给浏览器。

电脑浏览器中的 `127.0.0.1` 表示电脑自己。要从电脑直接访问路由器 Controller，应使用 `http://192.168.10.3:9090`。

## 插件动作与 REST 端点

| 插件动作 | REST 请求 | 结果 |
| --- | --- | --- |
| `status` | `GET /` | 基本运行状态 |
| `version` | `GET /version` | Mihomo 版本 |
| `proxies` | `GET /proxies` | 节点与策略组 |
| `connections` | `GET /connections` | 当前连接 |
| `traffic` | `GET /traffic` | 当前流量 |
| `rules` | `GET /rules` | 实际加载规则 |
| `providers` | `GET /providers/proxies` | 订阅提供者状态 |
| `select` | `PUT /proxies/<组名>` | 切换策略组选择 |
| `delay` | `GET /proxies/<节点>/delay?...` | 手动延迟测试 |
| `update-provider` | `PUT /providers/proxies/<名称>` | 立即更新订阅 |

## curl 示例

在路由器 SSH 中查看版本与节点：

```sh
curl http://127.0.0.1:9090/version
curl http://127.0.0.1:9090/proxies
```

将 `Proxy` 策略组切换为 `Auto`：

```sh
curl -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"name":"Auto"}' \
  'http://127.0.0.1:9090/proxies/Proxy'
```

手动测试指定节点的延迟：

```sh
curl 'http://127.0.0.1:9090/proxies/Auto/delay?url=https%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000'
```

若将来为 Controller 设置了密钥，增加请求头：

```sh
-H 'Authorization: Bearer <密钥>'
```

完整端点说明以 [Mihomo API 文档](https://wiki.metacubex.one/en/api/) 为准。
