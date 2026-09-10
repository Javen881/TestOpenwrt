m = Map("vlmcsd")

-- Reload vlmcsd after its configuration file has been saved and applied.
function m.on_after_apply(self)
	luci.sys.call("/etc/init.d/kms restart >/dev/null 2>&1")
end

s = m:section(TypedSection, "vlmcsd")
s.addremove = false
s.anonymous = true

config = s:option(TextValue, "config")
config.description = translate("This file is /etc/vlmcsd/vlmcsd.ini.")
config.template = "cbi/tvalue"
config.rows = 25
config.wrap = "off"

function config.cfgvalue(self, section)
	return nixio.fs.readfile("/etc/vlmcsd/vlmcsd.ini")
end

function config.write(self, section, value)
	value = value:gsub("\r\n?", "\n")
	nixio.fs.writefile("/etc/vlmcsd/vlmcsd.ini", value)
end

return m
