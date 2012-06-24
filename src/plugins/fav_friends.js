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
		$('<a />')
		.attr('href', 'javascript:void(0)')
		.attr('title', UNFAVED_TIP)
		.click(function(e) {
			e.stopPropagation();
			var faved = toggle(user_data);
			process(faved);
		})
		.appendTo($fav);
	}
	
	if (is_home_page) {
		var $insert = $('.stabs:not(#navtabs)').first();
		var $fav_friends = $('<div />').addClass('stabs colltab fav_friends');
		var $toggle = $('<b />').appendTo($fav_friends);
		var $fav_friends_title = $('<h2 />');
		$fav_friends_title
		.addClass('fav_friends_title')
		.text('有爱饭友')
		.contextmenu(function(e) {
			e.preventDefault();
			if (confirm('确实要清空有爱饭友列表？')) {
				fav_friends = [];
				saveData();
				SF.pl.fav_friends.unload();
				SF.pl.fav_friends.load();
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
		$fav[faved ? 'addClass' : 'removeClass']('faved');
		$('a', $fav).prop('title', faved ?
			FAVED_TIP : UNFAVED_TIP);
	}
	
	function updateUserData(index) {
		fav_friends.splice(index, 1, user_data);
		saveData();
	}
	
	function initializeList() {
		$fav_friends_list.empty();
		if (fav_friends.length) {
			var data = fav_friends.concat({
				userid:'',
				nickname:  '',
				avatar_url: '',
				user_url: ''
			});
			data.forEach(function(user_data, i) {
				$('<li />')
				.data('index', i)
				.append(
					$('<a />')
					.prop('href', user_data.user_url)
					.prop('title', user_data.nickname)
					.append(
						$('<img />')
						.prop('src', user_data.avatar_url)
						.prop('alt', user_data.nickname)
					)
					.append(
						$('<span />').text(user_data.nickname)
					)
				)
				.appendTo($fav_friends_list);
			});
			$('li', $fav_friends_list).last().addClass('shadow');
		} else {
			$fav_friends_list.text('把你常常翻看的饭友添加到这里..');
		}
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
			} else if (is_home_page) {
				$fav_friends.detach();
			}
		}
	}
})(jQuery));
