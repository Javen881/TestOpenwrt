include $(TOPDIR)/rules.mk

PKG_NAME:=mihomo
PKG_VERSION:=git
PKG_RELEASE:=1
PKG_LICENSE:=GPL-3.0-only
PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)
GO_PKG:=github.com/metacubex/mihomo
GO_PKG_BUILD_PKG:=$(GO_PKG)
GO_PKG_TAGS:=with_gvisor
include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/mihomo
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Mihomo Meta proxy core
  DEPENDS:=$(GO_ARCH_DEPENDS) +ca-bundle +ip-full +kmod-tun
endef

define Build/Prepare
	$(RM) -r $(PKG_BUILD_DIR)
	mkdir -p $(PKG_BUILD_DIR)
	cp -a $(CURDIR)/../../mihomo/. $(PKG_BUILD_DIR)/
endef

define Package/mihomo/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(GO_PKG_BUILD_BIN_DIR)/mihomo $(1)/usr/bin/mihomo
endef

$(eval $(call GoBinPackage,mihomo))
$(eval $(call BuildPackage,mihomo))
