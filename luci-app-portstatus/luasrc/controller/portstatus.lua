module("luci.controller.portstatus", package.seeall)

function index()
    entry({"admin", "status", "portstatus"}, template("portstatus/status"), _("Port Status"), 90)
    entry({"admin", "status", "portstatus", "data"}, call("get_status_data"), nil).leaf = true
end

function get_status_data()
    local sys = require "luci.sys"
    luci.http.prepare_content("application/json")
    luci.http.write(sys.exec("/usr/bin/port-status-dsa.sh"))
end

