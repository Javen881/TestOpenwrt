'use strict';
'require view';
'require form';
return view.extend({render:function(){var m=new form.Map('minimihomo',_('代理服务'),_('HTTP CONNECT、SOCKS5 和 Mixed 仅监听 LAN；插件不创建 WAN 防火墙放行规则。端口必须不同。'));[['http','HTTP / HTTPS CONNECT','7890'],['socks','SOCKS5','7891'],['mixed','Mixed HTTP / SOCKS5','7892']].forEach(function(x){var s=m.section(form.NamedSection,x[0],'proxy',_(x[1])),e=s.option(form.Flag,'enabled',_('启用'));e.default=x[0]!=='mixed'?e.enabled:e.disabled;var p=s.option(form.Value,'port',_('端口'));p.datatype='port';p.default=x[2];p.rmempty=false;});return m.render();},handleSaveApply:null,handleSave:null,handleReset:null});
