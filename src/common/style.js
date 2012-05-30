(function() {
	function $i(id) { return document.getElementById(id); }
	function $t(elem, tagName) {
		return elem ? elem.getElementsByTagName(tagName) : null;
	}
	function $cn(elem, className) {
		return elem ? elem.getElementsByClassName(className) : null;
	}
	function $c(tagname) { return document.createElement(tagname); }

	function removeBrackets(elems) {
		if (! elems) return;
		for (var i = 0; i < elems.length; ++i) {
			if (elems[i].innerHTML[0] != '(') continue;
			elems[i].innerHTML = elems[i].innerHTML.slice(1, -1);
		}
	}

	SF.fn.waitFor(function() {
		var $li = $t($i('navigation'), 'li');
		return $li && $li[3];
	}, function() {
		removeBrackets($cn($i('navigation'), 'count'));
	});

	SF.fn.waitFor(function() {
		var $li = $t($i('navtabs'), 'li');
		return $li && $li[3];
	}, function() {
		removeBrackets($cn($i('navtabs'), 'count'));
	});

	SF.fn.waitFor(function() {
		return $i('pagination-totop') || $i('footer');
	}, function() {
		var $, $totop;
		var hidden = false;
		function hideTotop() {
			if (! hidden && $totop) {
				$totop.hide();
				hidden = true;
			}
		}
		var totop = $i('pagination-totop');
		if (! totop) {
			var pagination = $cn(document, 'pagination')[0];
			if (! pagination) {
				pagination = $c('div');
				pagination.className = 'pagination';
				pagination.style = 'display: none;';
				if ($i('content')) {
					$i('content').appendChild(pagination);
				} else if ($i('stream')) {
					$i('stream').parentNode.appendChild(pagination);
				}
			}
			totop = $c('a');
			totop.id = 'pagination-totop';
			totop.href = '#';
			totop.innerHTML = '返回顶部';
			pagination.appendChild(totop);
		}
		totop.addEventListener('click', function(e) {
			hideTotop();
			SF.fn.goTop(e);
		}, false);
		SF.fn.waitFor(function() {
			return $ = window.jQuery;
		}, function() {
			var $win = $(window);
			var main_top = 66;
			$totop = $(totop);
			$totop.hide();
			$totop.removeClass('more more-right');
			$totop.css('visibility', 'visible');
			$win.scroll((function() {
				var onscroll = SF.fn.throttle(function() {
					hidden = false;
					if ($win.scrollTop() < main_top)
						$totop.fadeOut();
					else
						$totop.fadeIn();
				}, 500);
				return function() {
					hideTotop();
					onscroll();
				}
			})());
		});
	});

	SF.fn.waitFor(function() {
		return $i('upload-file') && $i('upload-button') &&
			$cn(document, 'upload-close-handle').length;
	}, function() {
		var upload_button = $i('upload-button');
		$i('upload-file').addEventListener('change', function(e) {
			upload_button.classList[this.files.length ? 'add' : 'remove']('file-chosen');
		}, false);
		$cn(document, 'upload-close-handle')[0].addEventListener('click', function(e) {
			upload_button.classList.remove('file-chosen');
		}, false);
	});
})();
