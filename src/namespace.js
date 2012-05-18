var SF = (function() {
	var empty_func = function() { };

	function pluginLoader(load_func) {
		return function() {
			if (this.loaded) return false;
			this.loaded = true;
			load_func.call(this);
			return true;
		};
	}

	function pluginUnloader(unload_func) {
		return function() {
			if (! this.loaded) return false;
			this.loaded = false;
			unload_func.call(this);
			return true;
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
		}
	};
})();
