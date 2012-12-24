var christmas_re = /圣[诞誕]快[乐樂]|Christmas|Xmas/i;

function checkStatus(status) {
	if (christmas_re.test(status)) {
		triggerSnowStorm();
		var now = (new Date) + '';
		SF.fn.setData('sf_snow_storm', now);
	}
}

function triggerSnowStorm() {
	var event = document.createEvent('Event');
	event.initEvent('merry_christmas', false, false);
	dispatchEvent(event);
}

addEventListener('sf_plugin_snowstorm_loaded', function(e) {
	removeEventListener(e.type, arguments.callee, false);

	var now = new Date;
	var last_triggered_time = new Date(SF.fn.getData('sf_snow_storm'));
	if (last_triggered_time.getTime() &&
		now - last_triggered_time <= 5 * 60 * 1000) {
		triggerSnowStorm();
		return;
	}

	var xhr = new XMLHttpRequest;
	var url = 'http://m.fanfou.com/home';
	xhr.open('GET', url, true);

	xhr.onload = function() {
		if (! xhr.response)
			return;

		var html = xhr.response;
		var re = /class="p">[^<]+<\/a> (.+) <span class="t">/;

		if (! re.test(html))
			return;

		html = html.match(re)[1];

		var status = html.split(' <span class="t">')[0];

		status = status.replace(/<[^>]+>/g, '');
		status = status.replace(/\s+/g, '');

		checkStatus(status);
	};

	xhr.send(null);
}, false);

(function() {
    var $form, $msg;

    function onMsgSubmit(e) {
        var status = $msg.value;
 		checkStatus(status);
   }

    function onKeyUp(e) {
        if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13))
            onMsgSubmit(e);
    }

    SF.fn.waitFor(function() {
        return ($form = $i('message')) &&
                ($msg = $i('message').getElementsByTagName('textarea')[0]);
    }, function() {
        $form.addEventListener('submit', onMsgSubmit, true);
        $msg.addEventListener('keyup', onKeyUp, true);
        $form.addEventListener('form_submit', onMsgSubmit, false);
    });
})();