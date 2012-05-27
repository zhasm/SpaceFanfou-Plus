SF.pl.logo_remove_beta = new SF.plugin((function($) {
	var $header = $('.global-header-content');
	if (! $header.length) return;

	$('#sf_style_logo_remove_beta').remove();

	var origin = $header.css('background-image');
	var beta = 'url(http://static2.fanfou.com/img/fanfou_beta.png)';

	return {
		load: function() {
			if (origin == beta) {
				$header.css('background-image', 'url(http://static2.fanfou.com/img/fanfou.png)');
			}
		},
		unload: function() {
			$header.css('background-image', origin);
		}
	};
})(jQuery));