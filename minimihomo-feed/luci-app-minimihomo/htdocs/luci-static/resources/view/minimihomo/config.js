'use strict';
'require view';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return fs.read('/etc/minimihomo/normalizer-report.txt').catch(function() {
			return '尚未导入配置。';
		});
	},

	render: function(report) {
		var uploaded = false;
		var editor = E('textarea', {
			rows: 20,
			style: 'width:100%;font-family:monospace',
			spellcheck: 'false',
			placeholder: '小型 YAML 可直接粘贴编辑。大型 YAML 请使用“上传 YAML 文件”。',
			input: function() { uploaded = false; }
		});
		var output = E('pre', { 'style': 'white-space:pre-wrap' }, report || '尚未导入配置。');

		function run(action) {
			output.textContent = '正在直接应用配置…';
			var save = uploaded ? Promise.resolve() : fs.write('/tmp/minimihomo-draft.yaml', editor.value, 384);
			return save.then(function() {
				return fs.exec_direct('/usr/libexec/minimihomo/config', [ action ]);
			}).then(function(result) {
				output.textContent = result || '操作完成。';
				if (action === 'apply')
					ui.addNotification(null, E('p', {}, '配置已直接应用；请查看下方启动日志。'), 'info');
			}).catch(function(err) {
				var reason = (err && (err.message || err.toString())) || '未知错误';
				output.textContent = '操作未执行：' + reason;
				ui.addNotification(null, E('p', {}, '无法执行配置操作：' + reason));
			});
		}

		function upload() {
			return ui.uploadFile('/tmp/minimihomo-draft.yaml').then(function(reply) {
				uploaded = true;
				editor.value = '';
				output.textContent = '已上传 ' + reply.name + '（' + reply.size + ' 字节）。现在点击“直接应用”。';
			}).catch(function(err) {
				output.textContent = '上传失败：' + ((err && (err.message || err.toString())) || '未知错误');
			});
		}

		return E([], [
			E('h2', {}, '配置文件'),
			E('p', {}, '大型 YAML 使用专用上传通道，不受 LuCI RPC 文本长度限制。插件不会校验或改写 YAML；应用后直接显示启动日志。'),
			E('button', { 'type': 'button', 'class': 'btn', 'click': ui.createHandlerFn(this, upload) }, '上传 YAML 文件'),
			editor,
			E('div', { 'class': 'cbi-page-actions' }, [
				E('button', { 'type': 'button', 'class': 'btn cbi-button-apply', 'click': ui.createHandlerFn(this, function() { return run('apply'); }) }, '直接应用'), ' ',
				E('button', { 'type': 'button', 'class': 'btn', 'click': ui.createHandlerFn(this, function() {
					return fs.exec_direct('/usr/libexec/minimihomo/config', ['revert']).then(function(result) {
						output.textContent = result || '已恢复上一版。';
					});
				}) }, '恢复上一版')
			]),
			E('h3', {}, '启动日志 / 保存说明'), output
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
