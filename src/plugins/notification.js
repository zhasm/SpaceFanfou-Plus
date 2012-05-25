SF.pl.notification = new SF.plugin((function() {
	var settings = SF.st.settings;
	var notifyonupdated = settings['notification.updates'];
	var notifyonmentioned = settings['notification.mentions'];
	var notifyonfollowed = settings['notification.followers'];
	var period = 60000;

	var source;
	var data, old_data;
	var username;

	var timer = {
		interval: null,
		setup: function() {
			this.interval = setInterval(check, period);
		},
		cancel: function() {
			if (! this.interval) return;
			clearInterval(this.interval);
			this.interval = null;
		}
	};

	var xhr = new XMLHttpRequest;
	var url = 'http://m.fanfou.com/home'

	function check() {
		abort();
		xhr.open('GET', url, true);
		xhr.onload = onload;
		try {
			xhr.send(null);
		} catch (e) { }
	}

	function onload() {
		if (! xhr.status || ! xhr.responseText) return;
		source = xhr.responseText;
		if (! checkIfLoggedIn()) return;
		getUsername();
		count();
		if (data.sum > old_data.sum) {
			notify();
		} else {
			for (var key in old_data) {
				if (! data.hasOwnProperty(key)) {
					key = null;
					continue;
				}
				if (data[key] && data[key] > old_data[key])
					return notify();
			}
			if (! key) {
				for (var key in data) {
					if (data.hasOwnProperty(key) && data[key])
						return notify();
				}
			}
		}
	}

	function abort() {
		try {
			xhr.abort();
		} catch (e) { }
	}

	function reset() {
		data = {};
		old_data = {};
		source = username = '';
	}

	function checkIfLoggedIn() {
		var re = /<a href=\"\/home(\?v=\d+)?\">刷新<\/a>/;
		return re.test(source);
	}

	function getUsername() {
		var re = /<title> 饭否 \| 欢迎你，(.+)<\/title>/;
		username = source.match(re)[1];
	}

	function count() {
		old_data = data;
		data = {};
		var sum = 0;
		if (notifyonmentioned) {
			checkAt();
			checkPM();
		}
		if (notifyonfollowed) {
			checkFo();
		}
		for (var key in data) {
			if (! data.hasOwnProperty(key)) continue;
			data[key] && (data[key] = data[key][1]);
			data[key] = parseInt(data[key] + '') || 0;
			sum += data[key];
		}
		data.sum = sum;
	}

	function checkAt() {
		var re = /<a href=\"\/mentions\">@我的\((\w*)\)<\/a>/;
		data.at = source.match(re);
	}

	function checkPM() {
		var re = /<a href="\/privatemsg">你有 (\d+) 条新私信<\/a>/;
		data.pm = source.match(re);
	}

	function checkFo() {
		var re = /<p>(\d+) 个人关注了你<\/p><p><span><a href=|(\d+) 个人申请关注你，<a href="/;
		data.fo = source.match(re);
	}

	function notify() {
		var msg = [];
		msg.push(data.at ? '你被 @ 了' + data.at + ' 次' : '');
		msg.push(data.pm ? '有' + data.pm + ' 封未读私信' : '');
		msg.push(data.fo ? '又有' + data.fo + ' 个饭友关注了你' : '');
		showNotification({
			type: 'text',
			content: msg.join('\n')
		});
	}

	return {
		update: function(a, b, c) {
			notifyonupdated = a;
			notifyonmentioned = b;
			notifyonfollowed = c;
		},
		load: function() {
			reset();
			if (notifyonmentioned || notifyonfollowed) {
				timer.setup();
				check();
			}
			if (SF.updated) {
				showNotification({
					type: 'text',
					content: '太空饭否++ 刚刚升级到了 ' + SF.version + '.'
				});
				SF.updated = false;
			}
		},
		unload: function() {
			abort();
			timer.cancel();
			reset();
		}
	};
})());