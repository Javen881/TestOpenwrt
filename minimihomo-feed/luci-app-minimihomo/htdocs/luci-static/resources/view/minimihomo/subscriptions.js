'use strict';
'require view';
'require form';
'require uci';

return view.extend({
	render: function() {
		var m = new form.Map('minimihomo', _('Subscriptions'), _('Mihomo downloads and parses enabled providers itself. Saving changes restarts the service.'));
		var s = m.section(form.GridSection, 'subscription', _('Providers'));
		s.addremove = true; s.anonymous = true;
		var o = s.option(form.Flag, 'enabled', _('Enabled')); o.default = o.enabled;
		o = s.option(form.Value, 'name', _('Name')); o.rmempty = false;
		o = s.option(form.Value, 'url', _('Subscription URL')); o.datatype = 'url'; o.rmempty = false;
		o = s.option(form.Value, 'interval', _('Update interval')); o.datatype = 'uinteger'; o.placeholder = '86400';
		o = s.option(form.Flag, 'health_check', _('Health check')); o.default = o.enabled;
		o = s.option(form.Value, 'health_interval', _('Health-check interval')); o.datatype = 'uinteger'; o.placeholder = '300';
		o = s.option(form.Value, 'health_url', _('Health-check URL')); o.datatype = 'url'; o.placeholder = 'https://www.gstatic.com/generate_204';
		o = s.option(form.Value, 'user_agent', _('User-Agent')); o.placeholder = 'mihomo';
		this.map = m;
		return m.render();
	},
	handleSaveApply: function(ev, mode) {
		/* Include these changes in the same UCI transaction as the provider.
		 * A post-apply command is unreliable because LuCI navigates away once
		 * the transaction has completed. */
		uci.set('minimihomo', 'global', 'enabled', '1');
		uci.set('minimihomo', 'global', 'config_source', 'generated');
		return this.super('handleSaveApply', [ ev, mode ]);
	}
});
