m = Map("vlmcsd")
m.title = translate("KMS Server")
m.description = translate("A KMS Server Emulator to active your Windows or Office")

-- Apply UCI changes after the asynchronous LuCI apply request has completed.
function m.on_after_apply(self)
	luci.sys.call("/etc/init.d/kms restart >/dev/null 2>&1")
end

m:section(SimpleSection).template  = "vlmcsd/vlmcsd_status"

s = m:section(TypedSection, "vlmcsd")
s.addremove = false
s.anonymous = true

enable = s:option(Flag, "enabled", translate("Enable"))
enable.rmempty = false

autoactivate = s:option(Flag, "autoactivate", translate("Auto activate"))
autoactivate.rmempty = false

return m
