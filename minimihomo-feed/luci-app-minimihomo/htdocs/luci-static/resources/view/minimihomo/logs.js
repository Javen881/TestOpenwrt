'use strict';
'require view';
'require fs';
'require form';
'require ui';
return view.extend({
	load:function(){return fs.exec_direct('/usr/libexec/minimihomo/api',['logs']);},
	render:function(log){var m=new form.Map('minimihomo',_('日志'),_('默认只保留 /tmp 中最近 200 行启动诊断，不写磁盘。启用系统日志后，Mihomo 标准输出会交给 OpenWrt logd；请仅在排障时使用。')),s=m.section(form.NamedSection,'global','global',_('日志控制')),o=s.option(form.ListValue,'log_level',_('Mihomo 日志等级'));['silent','error','warning','info','debug'].forEach(function(x){o.value(x);});o=s.option(form.Value,'log_lines',_('内存日志最大行数'));o.datatype='range(20,2000)';o.default='200';o=s.option(form.Flag,'system_log',_('写入 OpenWrt 系统日志'));o.default=o.disabled;o.description=_('关闭时不转发 Mihomo stdout/stderr 到 logd。');var p=E('pre',{style:'white-space:pre-wrap;max-height:42em;overflow:auto'},log||'暂无内存日志。');var b=s.option(form.Button,'clear',_('清空内存日志'));b.inputtitle=_('清空');b.onclick=function(){return fs.exec('/usr/libexec/minimihomo/api',['clear-logs']).then(function(){p.textContent='已清空。';ui.addNotification(null,E('p',{},'内存日志已清空。'));});};return m.render().then(function(node){return E([], [node,E('h3',{},'当前内存日志'),E('button',{class:'btn',click:ui.createHandlerFn(this,function(){return this.load().then(function(x){p.textContent=x||'暂无内存日志。';});})},'刷新'),p]);}.bind(this));},handleSaveApply:null,handleSave:null,handleReset:null
});
