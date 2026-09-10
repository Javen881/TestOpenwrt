include $(TOPDIR)/rules.mk

PKG_NAME:=vlmcsd
PKG_VERSION:=1113
PKG_RELEASE:=19

PKG_SOURCE:=vlmcsd-svn1113.tar.gz
PKG_SOURCE_URL:=file://$(TOPDIR)/package/vlmcsd
PKG_HASH:=skip
PKG_BUILD_DIR:=$(BUILD_DIR)/vlmcsd-svn1113

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=fuyumi <280604399@qq.com>

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/vlmcsd
  SECTION:=net
  CATEGORY:=Network
  TITLE:=vlmcsd for OpenWRT
  # Keep the user-visible package version compatible with prior svn builds.
  VERSION:=svn1113-r21
  URL:=http://forums.mydigitallife.info/threads/50234
  DEPENDS:=+libpthread
endef

define Package/vlmcsd/description
  vlmcsd is a KMS Emulator in C.
endef

MAKE_FLAGS += \
	-C $(PKG_BUILD_DIR)

define Package/vlmcsd/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/vlmcsd $(1)/usr/bin/vlmcsd
	$(INSTALL_DIR) $(1)/etc/vlmcsd
	$(INSTALL_BIN) ./files/vlmcsd.ini $(1)/etc/vlmcsd/vlmcsd.ini
endef

$(eval $(call BuildPackage,vlmcsd))
