include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI: Port Status Viewer
LUCI_DEPENDS:=+luci +rpcd +rpcd-mod-luci

PKG_NAME:=luci-app-portstatus
PKG_VERSION:=1.0
PKG_RELEASE:=1

include $(TOPDIR)/feeds/luci/luci.mk

LUCI_PKGARCH:=all

$(eval $(call BuildPackage,$(PKG_NAME)))
