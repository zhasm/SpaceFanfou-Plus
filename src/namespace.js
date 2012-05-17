var SF = (function() {
	var empty_func = function() { };

	function pluginLoader(load_func) {
		return function() {
			if (this.loaded) return;
			this.loaded = true;
			load_func.call(this);
		};
	}

	function pluginUnloader(unload_func) {
		return function() {
			if (! this.loaded) return;
			this.loaded = false;
			unload_func.call(this);
		};
	}

	return {
		fn: { },
		pl: { },
		cb: { },
		plugin: function(func) {
			if (! func) func = { };
			this.loaded = false;
			this.update = func.update || empty_func;
			this.load = pluginLoader(func.load || empty_func);
			this.unload = pluginUnloader(func.unload || empty_func);
		},
		unload: function() {
      for (var plugin in SF.pl) {
        if (! SF.pl.hasOwnProperty(plugin)) continue;
        setTimeout(SF.pl[plugin].unload.bind(SF.pl[plugin]), 0);
      }
      jQuery('#sf_flag_libs_ok, style.space-fanfou, script.space-fanfou').remove();
		}
	};
})();
