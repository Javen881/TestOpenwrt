module("luci.controller.portstatus", package.seeall)

function index()
    entry({"admin", "status", "portstatus"}, call("action_portstatus"), _("Port Status"), 90).dependent = false
end

function action_portstatus()
    local tpl = require "luci.template"
    tpl.render("portstatus")
end