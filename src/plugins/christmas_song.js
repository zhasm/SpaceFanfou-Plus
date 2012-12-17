SF.pl.christmas_song = new SF.plugin(function($) {
	if (! SF.fn.isChristmasDay())
		return;

	var $sidebar = $('#sidebar');
	if (! $sidebar.length) return;

	var $gift = $('<div />');
	$gift.attr('id', 'christmas_gift');
	$gift.attr('title', 'Merry Christmas!');

	$gift.click(function() {
		if (playing)
			stop();
		else
			play();
	});

	var ext_domain, sound,
		elems = document.getElementsByClassName('space-fanfou');

	[].some.call(elems, function(elem) {
		var url = elem.href;
		if (! url || url.indexOf('chrome-extension://') !== 0)
			return false;
		ext_domain = url.match(/^(chrome-extension:\/\/[^\/]+\/)/)[1];
		return true;
	});

	var playing = false;

	function play() {
		if (playing) return;
		playing = true;
		SF.fn.setData('christmas_song_playing', playing);

		sound = new Audio;
		sound.src = ext_domain + 'resources/sounds/jingle-bells.mp3';
		sound.play();

		sound.addEventListener('timeupdate', function(e) {
			if (sound && sound.duration == sound.currentTime)
				stop();
		}, false);
	};

	function stop() {
		if (! playing) return;
		playing = false;
		SF.fn.setData('christmas_song_playing', playing);

		sound.currentTime = 0;
		sound.pause();
		sound = null;
	}

	return {
		load: function() {
			SF.fn.waitFor(function() {
				return $('#footer').length;
			}, function() {
				$sidebar.append($gift);
			});
			if (SF.fn.getData('christmas_song_playing') === true)
				play();
		},
		unload: function() {
			stop();
			$gift.detach();
		}
	};
}(jQuery));