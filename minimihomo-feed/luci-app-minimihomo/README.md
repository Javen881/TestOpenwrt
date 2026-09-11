# MiniMihomo：构建、配置生成与 LuCI API 学习手册

适用对象：OpenWrt `qualcommax/ipq807x`（如 MX4200）上的 `luci-app-minimihomo`。项目仅保存本地源码；软件包由 OpenWrt SDK 交叉编译，Git 提交与推送由维护者手动完成。

本文件是完整合并版。按主题拆分的版本在 [`docs/`](docs/)：

- [`00-项目总览与问题复盘.md`](docs/00-项目总览与问题复盘.md)
- [`01-构建安装与运行配置.md`](docs/01-构建安装与运行配置.md)
- [`02-LuCI与Mihomo-API详解.md`](docs/02-LuCI与Mihomo-API详解.md)

## 1. 目录与产物

| 用途 | 位置 |
| --- | --- |
| 插件源码 | `/home/data/workspace/openwrt/TestOpenwrt/minimihomo-feed/luci-app-minimihomo` |
| OpenWrt SDK | `/home/data/workspace/openwrt/TestOpenwrt/openwrt-sdk-qualcommax-ipq807x_gcc-13.3.0_musl.Linux-x86_64_4200` |
| 最终 IPK | `SDK/bin/packages/aarch64_cortex-a53/minimihomo/` |
| UCI 配置 | 路由器：`/etc/config/minimihomo` |
| 实际运行配置 | 路由器：`/etc/minimihomo/runtime.yaml` |
| 临时运行日志 | 路由器：`/tmp/minimihomo.log` |

`/tmp` 位于内存文件系统，重启后清空，不会持续占用闪存。日志写入后会按 `log_lines`（默认 200 行）截断。

## 2. 从源码到 IPK

1. 将插件置入 SDK 的本地 feed，确认 `feeds.conf.default` 含对应 feed，并执行 `./scripts/feeds update -a` 和 `./scripts/feeds install -a`。
2. 在 SDK 根目录通过 `make menuconfig` 选择 LuCI → Applications → `luci-app-minimihomo`，确认目标为 `qualcommax/ipq807x` / `aarch64_cortex-a53`、musl。
3. 构建：

   ```sh
   make package/luci-app-minimihomo/compile V=s
   ```

4. 取用 `bin/packages/aarch64_cortex-a53/minimihomo/luci-app-minimihomo_2.0.0-r16_all.ipk`，上传到路由器安装。IPK 不会覆盖 `/etc/config/minimihomo`，因为该文件是 conffile。
5. 验证与开机启动：

   ```sh
   opkg list-installed | grep minimihomo
   /etc/init.d/minimihomo enable
   /etc/init.d/minimihomo restart
   ```

## 3. 两条配置路径

### 订阅生成模式

订阅页将 URL、更新周期、健康检查和分流偏好写入 UCI。服务启动时，`/usr/libexec/minimihomo/generate` 生成完整 `runtime.yaml`：

1. 扫描每个 UCI 区段，选择 URL 非空的订阅，不依赖区段名或 `enabled` 的具体表示。
2. 生成 `proxy-providers`，订阅缓存到 `./providers/<区段名>.yaml`。
3. 生成 `Proxy`、`Auto`、HK/TW/JP/SG/KR/US/Other 节点组。
4. 生成顶级 `rules`、LAN/CN/应用分流规则。
5. 使用临时文件完成后原子替换 `runtime.yaml`，避免留下半份文件。

URL 首尾空格会去除；订阅内容由 Mihomo 下载和解析。插件不再进行 YAML 校验或“矫正”，避免大文件或可运行的非标准订阅被改坏。

### 完整 YAML 导入模式

大文件通过 LuCI 上传接口先保存到 `/tmp/minimihomo-draft.yaml`，随后原样替换 `runtime.yaml`。不重排缩进、不改节点、不注入 Controller 字段，也不运行 `mihomo -t`。

完整 YAML 的可运行性由 Mihomo 决定；启动失败时查看日志，在自己的 YAML 中改正。导入模式严格保持原文件，因此不随本包的 Controller 设置改变。

## 4. 启动过程与排错

```text
LuCI 保存 / 导入
      ↓
/etc/config/minimihomo 或 runtime.yaml
      ↓
/etc/init.d/minimihomo start
      ↓
订阅模式：generate → runtime.yaml
自定义模式：直接使用 runtime.yaml
      ↓
procd 执行 mihomo -d /etc/minimihomo -f runtime.yaml
```

常用检查：

```sh
uci get minimihomo.global.enabled
/etc/init.d/minimihomo restart
tail -n 100 /tmp/minimihomo.log
mihomo -t -d /etc/minimihomo -f /etc/minimihomo/runtime.yaml
```

订阅生成报“没有 URL 非空的订阅”时，先检查 `uci show minimihomo`。完整 YAML 导入后无法运行时，重点检查 `proxy-groups:` 与 `rules:` 的缩进；`rules:` 必须为顶级键，不能缩入最后一个节点组。

## 5. Controller 的 LAN 访问

本版本的**订阅生成模式**会写出：

```yaml
external-controller: 192.168.10.3:9090
secret: ""
```

所以电脑访问路由器 Controller 使用：`http://192.168.10.3:9090`。不要在电脑浏览器访问 `http://127.0.0.1:9090`：该地址始终表示电脑自己；只有在路由器 SSH 中，`127.0.0.1:9090` 才表示路由器。

这是按确认后的策略设置的：能访问 `192.168.10.3` 的 LAN 设备无需密码即可控制 Mihomo。此监听只绑定路由器的 LAN 地址，**不要**修改为 `0.0.0.0`，也不要为 TCP 9090 新增 WAN 防火墙放行规则。未来若要收紧权限，恢复为 `external-controller: 127.0.0.1:9090`，或配置非空 `secret` 并在请求中提供 Bearer Token。Mihomo 官方说明：`external-controller` 是 REST API 监听地址，`secret` 是 API 密钥。[Mihomo general configuration](https://wiki.metacubex.one/en/config/general/)

自定义 YAML 不被插件修改；若也需从电脑访问，请自行在该 YAML 中加入上述字段。

## 6. LuCI 调用 Mihomo API 的过程

浏览器页面不直接依赖 LAN Controller。它先调用 LuCI RPC，LuCI 根据 ACL 权限执行 `/usr/libexec/minimihomo/api`，再由该脚本从路由器本机请求 `http://127.0.0.1:9090`。

```text
浏览器 LuCI 页面
   ↓ ubus / RPC
LuCI ACL（上传、UCI、受限命令权限）
   ↓
/usr/libexec/minimihomo/api <动作>
   ↓ curl 127.0.0.1:9090/<资源>
Mihomo Controller REST API
```

| LuCI 动作 | Mihomo 请求 | 用途 |
| --- | --- | --- |
| `status` / `version` | `GET /` / `GET /version` | 内核状态、版本 |
| `proxies` | `GET /proxies` | 节点和策略组 |
| `connections` | `GET /connections` | 当前连接 |
| `traffic` | `GET /traffic` | 实时总流量 |
| `rules` | `GET /rules` | 当前规则 |
| `providers` | `GET /providers/proxies` | 订阅提供者 |
| `select` | `PUT /proxies/<组名>`，数据 `{"name":"节点"}` | 手动切换节点 |
| `delay` | `GET /proxies/<节点>/delay?url=...&timeout=...` | 手动延迟测试 |
| `update-provider` | `PUT /providers/proxies/<名称>` | 立即更新订阅 |

路由器 SSH 示例：

```sh
curl http://127.0.0.1:9090/version
curl http://127.0.0.1:9090/proxies
curl -X PUT -H 'Content-Type: application/json' \
  -d '{"name":"Auto"}' \
  'http://127.0.0.1:9090/proxies/Proxy'
```

如果日后设置了非空 `secret`，每条 API 请求增加：

```sh
-H 'Authorization: Bearer <你的密钥>'
```

端点和参数的完整定义见 [Mihomo API 文档](https://wiki.metacubex.one/en/api/)。

## 7. 资源策略

节点页没有实时速率采样，也不会自动逐节点测速；页面只显示 Mihomo 已保存的延迟，只有手动点击才测试。订阅健康检查与 `Auto` 组 URL 测试仍属于运行配置本身，按 YAML/UCI 中设定的周期执行。

## 8. 升级原则

1. 先升级 `mihomo` 与本插件 IPK，再重启服务。
2. 订阅模式：保存订阅并重启，运行 YAML 会重新生成。
3. 自定义 YAML：先备份源文件再导入；插件不会替你修复 YAML。
4. 有异常时保留 `/tmp/minimihomo.log`、`runtime.yaml` 前 200 行以及 `uci show minimihomo` 再排查。
