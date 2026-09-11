'use strict';
'require view';
'require fs';
'require ui';

function json(raw) {
	try { return JSON.parse(raw); }
	catch (e) { return {}; }
}

function lastDelay(proxy) {
	var history = (proxy && proxy.history) || [];
	var latest = history.length ? history[history.length - 1] : null;
	return latest && Number(latest.delay) > 0 ? Number(latest.delay) + ' ms' : '未测速';
}

return view.extend({
	load: function() {
		return fs.exec_direct('/usr/libexec/minimihomo/api', ['proxies']);
	},

	render: function(raw) {
		var data = json(raw), groups = data.proxies || {};
		var output = E('pre', { 'style': 'white-space:pre-wrap' });
		var box = E('div', {}), delays = {};

		function choose(group, node) {
			return fs.exec('/usr/libexec/minimihomo/api', ['select', encodeURIComponent(group), node]).then(function(result) {
				output.textContent = (result.stdout || '') + (result.stderr || '') || ('已切换 ' + group + ' → ' + node);
			});
		}

		function test(node) {
			return fs.exec('/usr/libexec/minimihomo/api', ['delay', encodeURIComponent(node)]).then(function(result) {
				var tested = json(result.stdout || '');
				var text = Number(tested.delay) > 0 ? Number(tested.delay) + ' ms' : '测速失败';
				if (delays[node]) delays[node].textContent = '延迟：' + text;
			});
		}

		Object.keys(groups).forEach(function(name) {
			var group = groups[name];
			if (!group.all || !group.all.length) return;
			var list = E('ul', {});
			group.all.forEach(function(node) {
				var delay = E('span', { 'style': 'margin-left:.5em;color:#666' }, '延迟：' + lastDelay(groups[node]));
				delays[node] = delay;
				list.appendChild(E('li', {}, [
					node, node === group.now ? '（当前）' : ' ', delay, ' ',
					E('button', { 'type': 'button', 'class': 'btn btn-xs', 'click': ui.createHandlerFn(this, function() { return test(node); }) }, '测速'), ' ',
					E('button', { 'type': 'button', 'class': 'btn btn-xs', 'click': ui.createHandlerFn(this, function() { return choose(name, node); }) }, '切换')
				]));
			});
			box.appendChild(E('details', { 'open': name === 'Proxy' }, [
				E('summary', {}, name + '　当前：' + (group.now || '-') + '　(' + group.type + ')'), list
			]));
		});

		return E([], [
			E('h2', {}, '节点与策略组'),
			E('p', {}, '不进行实时速率采样或自动测速。显示的延迟来自配置自身的健康检查；“测速”仅在你手动点击时执行。'),
			box, output
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
