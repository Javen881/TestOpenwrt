include $(TOPDIR)/rules.mk
PKG_NAME:=luci-app-minimihomo
PKG_VERSION:=2.0.0
PKG_RELEASE:=16
LUCI_TITLE:=LuCI support for MiniMihomo
LUCI_DESCRIPTION:=A lightweight Mihomo Meta dashboard and runtime manager for OpenWrt
LUCI_DEPENDS:=+luci-base +mihomo +curl +ca-bundle +jshn
LUCI_PKGARCH:=all

define Package/luci-app-minimihomo/conffiles
/etc/config/minimihomo
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
