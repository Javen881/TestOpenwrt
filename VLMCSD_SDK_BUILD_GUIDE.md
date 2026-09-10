# OpenWrt SDK 编译 vlmcsd 与 LuCI 管理页面记录

本文记录 `vlmcsd` 和 `luci-app-vlmcsd` 在 OpenWrt SDK 中的本地构建、版本升级和 Web 开关修复过程。

## 目录和目标

项目根目录：`/home/data/workspace/openwrt/TestOpenwrt`。

| 路径 | 作用 |
| --- | --- |
| `vlmcsd/` | vlmcsd 包定义和源码压缩包 |
| `luci-app-vlmcsd/` | LuCI 页面和 init 脚本 |
| `openwrt-sdk-qualcommax-.../` | ipq807x / aarch64_cortex-a53 SDK |

## 本地源码包与 SDK 版本限制

本地源码为 `vlmcsd/vlmcsd-svn1113.tar.gz`，解压目录是 `vlmcsd-svn1113`。SDK 不适合将 `svn1113` 直接作为 `PKG_VERSION`，因此在 `vlmcsd/Makefile` 中使用：

```make
PKG_VERSION:=1113
PKG_SOURCE:=vlmcsd-svn1113.tar.gz
PKG_SOURCE_URL:=file://$(TOPDIR)/package/vlmcsd
PKG_BUILD_DIR:=$(BUILD_DIR)/vlmcsd-svn1113
```

这样构建版本只含数字，但仍能从 SDK 中的本地包目录读取压缩包，并匹配真实解压目录。

将包接入 SDK：

```sh
ln -s ../../vlmcsd package/vlmcsd
ln -s ../../luci-app-vlmcsd package/luci-app-vlmcsd
./scripts/feeds update luci
./scripts/feeds install luci
```

## 宿主机构建依赖

SDK 元数据扫描需要 GNU awk，配置工具需要 ncurses：

```sh
sudo apt-get update
sudo apt-get install -y gawk libncurses-dev
make defconfig
```

本次环境无法交互输入 sudo 密码，因此临时解压 Debian 依赖包供构建使用。正常环境推荐直接安装上面的依赖。

## 编译命令

在 SDK 根目录执行：

```sh
make package/vlmcsd/compile V=s -j2
make package/luci-app-vlmcsd/compile V=s -j2
```

检查二进制架构：

```sh
file build_dir/target-aarch64_cortex-a53_musl/vlmcsd-svn1113/.pkgdir/vlmcsd/usr/bin/vlmcsd
```

预期为 `ARM aarch64`、`/lib/ld-musl-aarch64.so.1`。

## opkg 拒绝安装的版本问题

设备旧包版本为 `svn1113-r19`。初次编译输出为 `1113-r19`，opkg 将其视为降级：

```text
Not downgrading package vlmcsd on root from svn1113-r19 to 1113-r19.
```

不能重新使用 `PKG_VERSION:=svn1113`，否则会触发 SDK 限制。解决方法是在 `define Package/vlmcsd` 中只覆写最终包版本：

```make
VERSION:=svn1113-r21
```

SDK 内部仍以 `1113` 构建，opkg 则看到一个高于 `svn1113-r19` 的升级包。

## LuCI 保存并应用无效

原页面可以写入：

```sh
uci set vlmcsd.config.enabled='0'
```

但没有在“保存并应用”后启动或停止服务。另外，旧 init 脚本让 vlmcsd 自行守护化，init 系统无法可靠追踪进程。因此会出现“可以关闭、不能重新启动”。

修复包括两部分。

### LuCI：在异步应用完成后操作服务

在 `basic.lua` 和 `config.lua` 中加入：

```lua
function m.on_after_apply(self)
	luci.sys.call("/etc/init.d/kms restart >/dev/null 2>&1")
end
```

使用 `on_after_apply`，而不是较早执行的 `on_after_commit`，以确保 UCI 异步应用完成后才重启服务。

### init：由 procd 管理 vlmcsd

在 `root/etc/init.d/kms` 中使用：

```sh
USE_PROCD=1

start_service() {
	config_load vlmcsd
	config_get_bool enabled config enabled 0
	[ "$enabled" -eq 1 ] || return 0

	procd_open_instance
	procd_set_param command /usr/bin/vlmcsd -D -i /etc/vlmcsd/vlmcsd.ini -L 0.0.0.0:1688 -L [::]:1688
	procd_set_param respawn 3600 5 5
	procd_close_instance
}

service_triggers() {
	procd_add_reload_trigger "vlmcsd"
}
```

`-D` 让 vlmcsd 前台运行，procd 可以追踪并在异常退出时重新拉起。

## LuCI 包版本递增

源码变化后，必须提高 LuCI 包的 release，否则 opkg 可能不覆盖安装：

```make
PKG_VERSION:=26.022.09553~82b8f17
PKG_RELEASE:=2
```

## 最终生成文件

```text
bin/packages/aarch64_cortex-a53/base/vlmcsd_svn1113-r21_aarch64_cortex-a53.ipk
bin/packages/aarch64_cortex-a53/base/luci-app-vlmcsd_26.022.09553~82b8f17-r2_all.ipk
```

## 路由器安装和验证

```sh
opkg install ./vlmcsd_svn1113-r21_aarch64_cortex-a53.ipk
opkg install ./luci-app-vlmcsd_26.022.09553~82b8f17-r2_all.ipk

uci set vlmcsd.config.enabled='1'
uci commit vlmcsd
/etc/init.d/kms restart
pgrep vlmcsd
```

关闭测试：

```sh
uci set vlmcsd.config.enabled='0'
uci commit vlmcsd
/etc/init.d/kms restart
pgrep vlmcsd
```

关闭时 `pgrep` 应无输出；开启时应输出 PID。之后可在 LuCI 的 **服务 → KMS Server** 页面切换 Enable 并点击“保存并应用”，服务应立即启动或停止。
