# MiniMihomo 2.0

轻量 OpenWrt Mihomo 管理层。Mihomo 是唯一常驻代理进程；LuCI 只在访问页面或执行操作时运行，不引入数据库、流量守护进程或额外运行时。

## LuCI 页面

- 概览：服务、版本、当前策略组与连接数。
- 配置：在线订阅、完整 YAML 原样导入与当前运行配置。
- 节点：读取策略组并直接通过 Mihomo API 切换与测速。
- 分流：应用、国家/地区和高级自定义规则，绑定策略组而非具体节点。
- DNS / TUN、代理服务、实时连接、日志。

## 配置链路

### 订阅生成模式

```text
UCI 订阅配置 → generate → runtime.yaml → Mihomo
```

生成器按 URL 非空识别订阅，生成 `proxy-providers`、策略组与规则。配置在临时文件中完整生成后，再原子替换 `runtime.yaml`。

### 完整 YAML 导入模式

```text
LuCI 上传 → /tmp/minimihomo-draft.yaml → runtime.yaml → Mihomo
```

导入内容保持原样：不重排、不校验、不矫正，也不注入 Controller 字段。若配置无法运行，查看 `/tmp/minimihomo.log` 后由用户自行修改 YAML。

订阅由 Mihomo 的 `proxy-providers` 原生下载、解析和健康检查。日志仅保留在 `/tmp`，并受 `log_lines` 行数限制。节点页没有实时速率采样或自动逐节点测速。

## 文档

完整学习与运维手册见 [`luci-app-minimihomo/README.md`](luci-app-minimihomo/README.md)，并按主题拆分在 [`luci-app-minimihomo/docs/`](luci-app-minimihomo/docs/)。

## 构建

在 OpenWrt SDK 根目录配置本地 feed 后：

```sh
make package/luci-app-minimihomo/compile V=s
```

生成的包位于 `bin/packages/<arch>/minimihomo/`。核心源码位于同级 `../mihomo`，构建使用 Meta 分支。
