include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Port Status Viewer (swconfig)
LUCI_DEPENDS:=+swconfig +luci-base
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

PKG_NAME:=luci-app-portstatus

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || /etc/init.d/uhttpd restart
endef

LUCI_FILES:=luasrc i18n

$(eval $(call BuildPackage,$(PKG_NAME)))