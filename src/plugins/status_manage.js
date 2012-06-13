SF.pl.status_manage = new SF.plugin((function($) {
	if (! SF.fn.isMyPage()) return;
	if (! $('#stream li .op .delete').length) return;

	var $paginator = $('ul.paginator');
	var $li = $('#stream li');

	if (! $paginator.length || ! $li.length) return;

	var $manage = $('<div />');
	$manage.addClass('batch-manage');

	var $del = $('<a>删除选定</a>');
	$del.addClass('delete');
	$del.click(function(evt) {
		var $todel = $('#stream li input[type=checkbox]:checked');
		var length = $todel.length;
		if (! length) return;
		if (! confirm('确定要删除选定的' + $todel.length + '条消息吗？'))
			return;
		var count = 0;
		$todel.each(function() {
			var $t = $(this);
			var $del = $t.parent().find('a.delete');
			$.ajax({
				type: 'POST',
				url: location.href,
				data: {
					action: 'msg.del',
					msg: $t.attr('msgid'),
					token: $del.attr('token'),
					ajax: 'yes',
				},
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
				success: function(data) {
					if (data.status) {
						FF.util.yFadeRemove($del.get(0), 'li');
						if (++count === length) location.reload();
					} else {
						alert(data.msg);
					}
				},
			});
		});
	});

	var $select = $('<select />');
	$select
	.append(
		$('<option />')
		.val('default')
		.text('筛选..')
	)
	.append(
		$('<option />')
		.val('select-all')
		.text('全选')
	)
	.append(
		$('<option />')
		.val('toggle')
		.text('反选')
	)
	.append(
		$('<option />')
		.val('select-replies')
		.text('选中回复')
	)
	.append(
		$('<option />')
		.val('select-reposts')
		.text('选中转发')
	)
	.change(function(evt) {
		switch (this.value) {
		case 'default':
			break;
		case 'select-all':
			$('#stream li input[type=checkbox]')
			.prop('checked', true);
			break;
		case 'toggle':
			$('#stream li input[type=checkbox]')
			.each(function() {
				var $checkbox = $(this);
				$checkbox.
				prop('checked', ! $checkbox.prop('checked'));
			});
			break;
		case 'select-replies':
			$('#stream li[reply-status] input[type=checkbox]')
			.prop('checked', true);
			break;
		case 'select-reposts':
			$('#stream li[repost-status] input[type=checkbox]')
			.prop('checked', true);
			break;
		}
		this.value = 'default';
	});

	$manage
	.append($select)
	.append($del);

	return {
		load: function() {
			$li.each(function() {
				var $chk = $('<input>');
				$chk.attr('type', 'checkbox');
				var msgid = $('.op a', this).attr('href').split('/').pop();
				$chk.attr('msgid', msgid);
				$chk.appendTo(this);
				var $reply = $('>.stamp>.reply', this);
				if ($reply.length) {
					$(this).
					attr($reply.text().indexOf('转自') === 0 ?
						'repost-status' : 'reply-status', '');
				}
			});
			$paginator.prepend($manage);
		},
		unload: function() {
			$('#stream li input[type=checkbox]').remove();
			$li
			.removeAttr('repost-status')
			.removeAttr('reply');
			$manage.detach();
		}
	};
})(jQuery));
