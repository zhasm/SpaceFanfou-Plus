(function($) {
	
	/* 判断 Chrome 版本号 */
	
	(function() {
		var ua = navigator.userAgent.toLowerCase();
		var re = /.*chrome\/([\w.]+).*/;
		var full_version = re.exec(ua)[1];
		var main_version = parseInt(full_version, 10);
		var key = '__sf_version_check__';
		if (main_version < 18 && localStorage[key] === undefined) {
			localStorage[key] = true;
			alert('您正在使用较旧版本的 Chrome 浏览器 (' +
				full_version + 
				'). 太空饭否++ 以后的版本将停止提供对 17 及以下版本 Chrome 的支持. ' + 
				'强烈建议您立即升级到最新版本.');
		}
	})();

	/* 输入框自动获得焦点 */
	
	(function() {
		var $textarea = $('#phupdate textarea');
		if (! $textarea.length) return;
		var body = document.body;
		var textarea = $textarea[0];
		var pos = $textarea.offset().top + textarea.offsetHeight;
		$textarea = null;
		var focused = true;
		addEventListener('scroll', SF.fn.throttle(function(e) {
			if (body.scrollTop > pos) {
				focused && textarea.blur();
				focused = false;
			} else {
				focused || textarea.focus();
				focused = true;
			}
		}, 250), false);
	})();

})(jQuery);
