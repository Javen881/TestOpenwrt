#
# Copyright (C) 2008-2014 The LuCI Team <luci@lists.subsignal.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for KMS
LUCI_DEPENDS:=+vlmcsd
LUCI_PKGARCH:=all

PKG_NAME:=luci-app-vlmcsd
# Pin the source version so the local service-reload fix can carry a package
# revision that opkg recognizes as newer than the previously built package.
PKG_VERSION:=26.022.09553~82b8f17
PKG_RELEASE:=2

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
