SF.pl.remove_app_recom = new SF.plugin((function($) {
	var $goodapp = $('#goodapp');
	if (! $goodapp.length) return;

	var list = [];
	var app_url = $('>a', $goodapp).attr('href');

	function getList() {
		list = SF.fn.getData('sfplus_blocked_app_list') ||
			[ 'http://is.gd/sfplus' ];
	}

	function saveList() {
		SF.fn.setData('sfplus_blocked_app_list', list);
	}

	var $btn = $('<span />');
	$btn
		.text('x')
		.css({
			position: 'absolute',
			top: '5px',
			right: '9px',
			cursor: 'pointer'
		})
		.prop('title', '不再推荐这个应用')
		.click(function(e) {
			e.stopPropagation();
			$goodapp.hide();

			if (list.indexOf(app_url) === -1) {
				list.push(app_url);
				saveList();
			}
		})
		.appendTo($goodapp);

	return {
		'load': function() {
			getList();

			if (list.indexOf(app_url) > -1) {
				$goodapp.hide();
			} else {
				$goodapp.show();
			}

			$goodapp.append($btn).css('position', 'relative');
		},
		'unload': function() {
			$goodapp.show().css('position', '');
			$btn.detach();
		}
	};
})(jQuery));
