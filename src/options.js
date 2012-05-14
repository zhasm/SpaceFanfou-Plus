var $ = document.getElementById.bind(document);
var $$ = document.querySelectorAll.bind(document);

document.addEventListener('DOMContentLoaded', function() {
	function forEach(array, func, context) {
		return Array.prototype.forEach.call(array, func, context);
	}

	function getValue($elem) {
		if ($elem.type == 'checkbox')
			return $elem.checked;
		else
			return eval($elem.value);
	}
	function setValue($elem, value) {
		if ($elem.type == 'checkbox') {
			if ($elem.checked !== value)
				SF.fn.emulateClick($elem);
		} else $elem.value = value;
	}

  var $foldables = $$('[foldable]');
  forEach($$('[foldable]'), function($foldable) {
		var $foldable_src = $foldable.querySelector('[foldable_src]');
		setValue($foldable_src, true);

		$foldable_src.addEventListener('change', function(e) {
			if (getValue(this))
				$foldable.classList.remove('folded');
			else
				$foldable.classList.add('folded');
		}, false);
	});
	forEach($$('[foldable_tgt]'), function($f) {
		$f.style.height = $f.offsetHeight + 'px';
	});

	// 获取选项信息
	forEach($$('[key]'), function($t) {
		setValue($t, SF.st.settings[$t.getAttribute('key')]);
	});

	$('btn_apply').addEventListener('click', function() {
		var key;
		forEach($$('[key]'), function($t) {
			key = $t.getAttribute('key');
			SF.st.settings[key] = getValue($t);
		});
		localStorage['settings'] = JSON.stringify(SF.st.settings);
	});

	window.addEventListener('unload', function() {
		SF.fn.emulateClick($('btn_apply'));
	}, false);

	$('version').textContent = localStorage['sf_version'];

	var $wrapper = $('wrapper');
  var $screenshots = $$('.screenshot');
  var $tabs = $('tabs');
  var $screenshot = $('screenshot');
  var $preview_img = $('preview_img');
  var $preview_des = $('preview_des');

  var timeout;
  for (var i = 0; i < $screenshots.length; i++) {
    var $ss = $screenshots[i];
    $ss.description = $ss.title;
    $ss.title = '';
    $ss.addEventListener('mouseover', function(e) {
			if (e.target != this) return;
      $preview_img.src = this.rel;
      $preview_des.textContent = this.description;
      clearTimeout(timeout);
      $screenshot.classList.remove('hide');
      $screenshot.classList.remove('fadeOut');
    }, false);
    $ss.addEventListener('mousemove', function(e) {
      posPreview(e.pageX, e.pageY);
    }, false);
    $ss.addEventListener('mouseout', function(e) {
			if (e.target != this) return;
      $screenshot.classList.add('fadeOut');
      timeout = setTimeout(function() {
        $screenshot.classList.add('hide');
      }, 250)
    }, false);
  }

  var oH = $wrapper.offsetHeight;
  function posPreview(x, y) {
    var targetX = x + 30;
				targetY = y - 10;

    var height = $screenshot.clientHeight;
    if (targetY + height > oH)
        targetY = oH - height - 10;

    $screenshot.style.left = targetX + 'px';
    $screenshot.style.top = targetY + 'px';
  }
}, false);
