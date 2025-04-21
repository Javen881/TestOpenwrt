include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI: Port Status Viewer (DSA)
LUCI_DESCRIPTION:=View and manage physical port status with DSA
LUCI_DEPENDS:=+luci +luci-base +rpcd +rpcd-mod-luci +iptables

PKG_NAME:=luci-app-portstatus
PKG_VERSION:=1.0
PKG_RELEASE:=1

include $(TOPDIR)/feeds/luci/luci.mk

# 这里是你的 Lua 页面和脚本的位置
LUCI_PKGARCH:=all

include $(TOPDIR)/package.mk

