'use strict';
'require view';
'require fs';
return view.extend({
 load:function(){return Promise.all(['/etc/minimihomo/original.yaml','/etc/minimihomo/normalized.yaml','/etc/minimihomo/runtime.yaml','/etc/minimihomo/normalizer-report.txt'].map(function(x){return fs.read(x).catch(function(){return '';});}));},
 render:function(data){var names=['原始配置（永不修改）','规范化配置','运行配置','矫正报告'];return E([], [E('h2',{},'当前配置'),E('p',{},'只有运行配置会交给 Mihomo；可在这里检查导入前后的差异。')].concat(data.map(function(x,i){return E('details',{open:i===2},[E('summary',{},names[i]),E('pre',{style:'white-space:pre-wrap;max-height:28em;overflow:auto'},x||'暂无内容')]);})));},handleSaveApply:null,handleSave:null,handleReset:null
});
