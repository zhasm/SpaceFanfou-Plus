SF.pl.fav_friends = new SF.plugin((function($) {
	var is_user_page = SF.fn.isUserPage() || SF.fn.isMyPage();
	var is_home_page = location.href.indexOf('http://fanfou.com/home') === 0;
	
	var FAVED_TIP = '从有爱饭友列表去除';
	var UNFAVED_TIP = '加入有爱饭友列表';
	
	if (is_user_page) {
		var $avatar_link = $('#avatar a');
		var my_page_url = $('#navigation li a').eq(1).prop('href');
		var avatar_link_url = $avatar_link.prop('href');
		var user_data = {
			userid: SF.fn.isMyPage() ? 
				(my_page_url || '').split('/').reverse()[0] : decodeURIComponent(avatar_link_url.split('/').reverse()[0]),
			nickname:  $('#panel h1').text(),
			avatar_url: $avatar_link.find('img').prop('src')
		};
		user_data.user_url = 'http://fanfou.com/' + user_data.userid;
		var $fav = $('<span />');
		$fav.addClass('fav_friends');
		var $star = $('<a />');
		$star
		.attr('href', 'javascript:void(0)')
		.attr('title', UNFAVED_TIP)
		.click(function(e) {
			e.stopPropagation();
			var faved = toggle(user_data);
			process(faved);
		});
	}
	
	if (is_home_page) {
		var $insert = $('.stabs:not(#navtabs)').first();
		var $fav_friends = $('<div />').addClass('stabs colltab fav_friends');
		var $toggle = $('<b />').appendTo($fav_friends);
		var $fav_friends_title = $('<h2 />');
		$fav_friends_title
		.addClass('fav_friends_title')
		.text('有爱饭友')
		.prop('title', '1. 拖拽头像可以重新排序\n2. 按住 Shift 键点击头像可以删除\n3. 右击这里可以清空列表')
		.contextmenu(function(e) {
			if (! fav_friends.length) return;
			e.preventDefault();
			if (confirm('确定要清空有爱饭友列表？')) {
				fav_friends = [];
				saveData();
				initializeList();
			}
		})	
		.click(function(e) {
			$fav_friends_list.toggle();
			var visible = $fav_friends_list.is(':visible');
			if (visible) {
				$toggle.removeClass('collapse');
			} else {
				$toggle.addClass('collapse');
			}
			SF.fn.setData('fav_friends_list_visible', visible);
		})
		.appendTo($fav_friends);
		$fav_friends_list = $('<ul />').prop('id', 'friends');
		$fav_friends_list
		.addClass('alist')
		.prop('draggable', true)
		.on({
			'dragover': function(e) {
				e.preventDefault();
			},
			'drop mouseleave': resetDragging
		})
		.appendTo($fav_friends);
	}
	
	var fav_friends = getData();
	
	function getIndex(userid) {
		var index = -1;
		fav_friends.some(function(item, i) {
			if (user_data.userid === item.userid) {
				index = i;
				return true;
			}
			return false;
		});
		return index;
	}
	
	function toggle(user_data) {
		var index = getIndex(user_data.userid);
		if (index > -1)
			fav_friends.splice(index, 1);
		else
			fav_friends.push(user_data);
		saveData();
		return index === -1;
	}
	
	function process(faved) {
		$('#info')[faved ? 'addClass' : 'removeClass']('faved');
		$star.prop('title', faved ? FAVED_TIP : UNFAVED_TIP);
	}
	
	function updateUserData(index) {
		fav_friends.splice(index, 1, user_data);
		saveData();
	}
	
	function resetDragging() {
		$('.drag-source', $fav_friends_list).removeClass('drag-source');
	}
	
	function initializeList() {
		$fav_friends_list.empty();
		if (fav_friends.length) {
			fav_friends.forEach(function(user_data, i) {
				var $li = $('<li />');
				$li
				.data('user_data', user_data)
				.append(
					$('<a />')
					.prop('href', user_data.user_url)
					.prop('title', user_data.nickname)
					.append(
						$('<img />')
						.prop('src', user_data.avatar_url)
						.prop('alt', user_data.nickname)
						.click(function(e) {
							if (! e.shiftKey) return;
							e.preventDefault();
							e.stopPropagation
							$li.remove();
							saveListData();
							if (! fav_friends.length) {
								initializeList();
							}
						})
					)
					.append(
						$('<span />').text(user_data.nickname)
					)
				)
				.prop('draggable', true)
				.on({
					'drag': function(e) {
						$li.addClass('drag-source');
					},
					'dragover': function(e) {
						if ($li.hasClass('drag-source')) return;
						e.preventDefault();
						$li.addClass('dragover');
					},
					'dragleave drop': function(e) {
						$li.removeClass('dragover');
					},
					'drop': function(e) {
						if ($li.hasClass('drag-source')) return;
						var $dragsource = $('.drag-source', $fav_friends_list);
						if (! $dragsource.length) return;
						var $placeholder = $('<span />');
						$dragsource
						.after($placeholder)
						.insertAfter($li)
						.removeClass('drag-source');
						$li.insertAfter($placeholder);
						$placeholder.remove();
						saveListData();
					}
				})
				.appendTo($fav_friends_list);
			});
		} else {
			$fav_friends_list.text('把你常常翻看的饭友添加到这里..');
		}
	}
	
	function saveListData() {
		fav_friends = [];
		$('>li', $fav_friends_list).each(function() {
			fav_friends.push($(this).data('user_data'));
			saveData();
		});
	}
	
	function getData() {
		return SF.fn.getData('fav_friends') || [];
	}
	
	function saveData() {
		SF.fn.setData('fav_friends', fav_friends);
	}
	
	return {
		load: function() {
			if (is_user_page) {
				var index = getIndex(user_data.userid);
				var faved = index > -1;
				if (faved) {
					updateUserData(index);
				}
				process(faved);
				$fav.appendTo('#info');
				$star.appendTo('#panel h1');
			} else if (is_home_page) {
				initializeList();
				$insert.before($fav_friends);
				if (SF.fn.getData('fav_friends_list_visible') === false) {
					$fav_friends_title.click();
				}
			}
		},
		unload: function() {
			if (is_user_page) {
				$fav.detach();
				$star.detach();
			} else if (is_home_page) {
				$fav_friends.detach();
			}
		}
	}
})(jQuery));
