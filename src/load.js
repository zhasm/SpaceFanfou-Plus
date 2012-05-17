function $i(id) { return document.getElementById(id); }
function $c(tagname) { return document.createElement(tagname); }
function $t(text) { return document.createTextNode(text); }

var docelem = document.documentElement;
var timeout;
var fragment;

function insertCode(type, code, name) {
	var id ='sf_' + type + '_' + name;
	if ($i(id)) return;
	var $code = $c(type);
	$code.appendChild($t(code));
	if (name) $code.id = id;
	$code.className = 'space-fanfou';

	fragment = fragment || document.createDocumentFragment();
	fragment.appendChild($code);
	clearTimeout(timeout);
	timeout = setTimeout(apply, 0);
}

function insertStyle(style, name) {
	insertCode('style', style, name);
}

function insertScript(script, name) {
	insertCode('script', script, name);
}

function apply() {
	if (! fragment) return;
	docelem.appendChild(fragment);
	delete fragment;
}

var port = chrome.extension.connect();
port.onDisconnect.addListener(function() {
	location.assign('javascript:SF.unload();');
});
port.onMessage.addListener(function(msg) {
	if (typeof msg == 'string')
		msg = JSON.parse(msg);

	if (msg.type == 'init') {
		var scripts = [];
		insertScript(msg.common.namespace, 'namespace');
		insertScript(msg.common.functions, 'functions');
		insertScript(msg.common.style.js, 'style');
		scripts.push([msg.common.common, 'common']);
		var load_plugins = [];
		for (var i = 0; i < msg.data.length; ++i) {
			var item = msg.data[i];
			if (item.style) insertStyle(item.style, item.name);
			if (item.script) {
				scripts.push([item.script, 'plugin_' + item.name]);
				load_plugins.push('setTimeout(function() {');
				var plugin = 'SF.pl.' + item.name;
				if (item.options) {
					load_plugins.push(
						plugin + '.update.apply(' + plugin + ', ' +
						JSON.stringify(item.options) + ');');
				}
				load_plugins.push(plugin + '.load();');
				load_plugins.push('}, 0);');
			}
		}
		scripts.push([load_plugins.join('\n')]);
		insertScript(msg.common.probe, 'probe');
		SF.fn.waitFor(function() {
			return $i('sf_flag_libs_ok');
		}, function() {
			for (var i = 0; i < scripts.length; ++i)
				insertScript.apply(insertScript, scripts[i]);
			SF.loaded = true;
			delete scripts;
		});
	} else if (msg.type == 'update') {
		for (var i = 0; i < msg.data.length; ++i) {
			var item = msg.data[i];
			var plugin = 'SF.pl.' + item.name;
			var updates = [];
			switch (item.type) {
				case 'update':
					updates.push(
							plugin + '.update.apply(' + plugin + ',' +
							JSON.stringify(item.options) + ');');
					break;
				case 'enable':
					if (item.style)
						insertStyle(item.style, item.name);
					if (item.script) {
						insertScript(item.script, item.name);
						if (item.options) {
							updates.push(
									plugin + '.update.apply(' + plugin + ',' +
									JSON.stringify(item.options) + ');');
						}
						updates.push(plugin + '.load();');
					}
					break;
				case 'disable':
					updates.push('if(' + plugin + ')' + plugin + '.unload();');
					updates.push('jQuery(' +
								 '"#sf_script_' + item.name + '").remove();');
					updates.push('jQuery(' +
								 '"#sf_style_' + item.name + '").remove();');
					break;
			}
			// 对每个插件单独执行可以防止一个更新错误影响后面的更新
			location.assign('javascript:' + updates.join(''));
		}
	}
});
