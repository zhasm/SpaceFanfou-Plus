function $i(id) { return document.getElementById(id); }
function $c(tagname) { return document.createElement(tagname); }
function $t(text) { return document.createTextNode(text); }

var docelem = document.documentElement;
var fragment = document.createDocumentFragment();

function insertCode(type, code, name) {
	var id ='sf_' + type + '_' + name;
	if (name && $i(id)) return;
	var $code = $c(type);
	if (code.indexOf('chrome-extension://') === 0) {
		if (type == 'style') {
			$code = $c('link');
			$code.href = code;
			$code.rel = 'stylesheet';
		} else {
			$code.src = code;
		}
	} else {
		$code.appendChild($t(code));
	}
	if (name) $code.id = id;
	$code.className = 'space-fanfou';

	if (type == 'script')
		$code.setAttribute('defer', '');

	setTimeout(function() {
		fragment.appendChild($code);
		apply();
	}, 0);

	return $code;
}

function insertStyle(style, name) {
	return insertCode('style', style, name);
}

function insertScript(script, name) {
	return insertCode('script', script, name);
}

var apply = SF.fn.throttle(function() {
	if (! fragment) return;
	try {
		docelem.appendChild(fragment);
	} catch (e) { }
}, 0);

var loadScript = (function() {
	var waiting_list = [];
	var slice = Array.prototype.slice;
	var load = SF.fn.throttle(function() {
		if (! waiting_list.length) return;
		var $code = insertScript.apply(
			insertScript, waiting_list.shift());
		if ($code.complete || ! $code.src)
			load();
		else
			$code.onload = $code.onerror = load;
	}, 0);
	return function() {
		waiting_list.push(slice.call(arguments, 0));
		load();
	}
})();

if (($i('sf_flag_libs_ok') || {}).name == 'spacefanfou-flags') {
	location.assign('javascript:(' + SF.unload + ')();');
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
		insertStyle(msg.common.style.css, 'common');
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
		load_plugins = null;
		insertScript(msg.common.probe, 'probe');
		SF.fn.waitFor(function() {
			return $i('sf_flag_libs_ok');
		}, function() {
			for (var i = 0; i < scripts.length; ++i)
				loadScript.apply(null, scripts[i]);
			SF.loaded = true;
			scripts = null;
		});
	} else if (msg.type == 'update') {
		for (var i = 0; i < msg.data.length; ++i) {
			var item = msg.data[i];
			var plugin = 'SF.pl.' + item.name;
			var updates = [];
			switch (item.type) {
				case 'update':
          updates.push('if(' + plugin + ')');
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
			insertScript(updates.join(''), 'update_' + item.name);
		}
		insertScript('jQuery("[id^=sf_script_update_]").remove();', 'update_clear');
	}
});