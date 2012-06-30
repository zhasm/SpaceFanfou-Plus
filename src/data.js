/* 扩展信息 */

var plugins = [

	/* 页面样式扩展 */

	{
		name: 'font_reset_cn',
		css: 'font_reset_cn.css',
		sync: true
	},
	{
		name: 'translucent_sidebar',
		css: 'translucent_sidebar.css'
	},
	{
		name: 'box_shadows',
		css: 'box_shadows.css'
	},
	{
		name: 'newstyle_trendlist',
		css: 'newstyle_trendlist.css'
	},
	{
		name: 'newstyle_op_icons',
		css: 'newstyle_op_icons.css'
	},
	{
		name: 'logo_remove_beta',
		css: 'logo_remove_beta.css',
		js: 'logo_remove_beta.js',
		sync: true
	},
	{
		name: 'remove_app_recom',
		css: 'remove_app_recom.css'
	},

	/* 页面功能性扩展 */

	{
		name: 'expanding_replies',
		options: [
			'number',
			'auto_expand'
		],
		js: 'expanding_replies.js',
		css: 'expanding_replies.css'
	},
	{
		name: 'user_switcher',
		js: 'user_switcher.js',
		css: 'user_switcher.css'
	},
	{
		name: 'float_message',
		options: [
			'noajaxattop',
			'notlostfocus',
			'keepmentions'
		],
		js: 'float_message.js',
		css: 'float_message.css'
	},
	{
		name: 'disable_autocomplete',
		js: 'disable_autocomplete.js'
	},
	{
		name: 'privatemsg_manage',
		js: 'privatemsg_manage.js',
		css: 'privatemsg_manage.css'
	},
	{
		name: 'friend_manage',
		js: 'friend_manage.js',
		css: 'friend_manage.css'
	},
	{
		name: 'advanced_sidebar',
		js: 'advanced_sidebar.js',
		css: 'advanced_sidebar.css'
	},
	{
		name: 'clean_personal_theme',
		js: 'clean_personal_theme.js',
		css: 'clean_personal_theme.css'
	},
	{
		name: 'auto_pager',
		js: 'auto_pager.js'
	},
	{
		name: 'status_manage',
		js: 'status_manage.js',
		css: 'status_manage.css'
	},
	{
		name: 'fav_friends',
		js: 'fav_friends.js',
		css: 'fav_friends.css'
	},

	/* 其他扩展 */

	{
		name: 'share_to_fanfou',
		type: 'background',
		js: 'share_to_fanfou.js'
	},
	{
		name: 'notification',
		type: 'background',
		options: [
			'updates',
			'mentions',
			'followers',
			'notdisturb',
			'playsound'
		],
		js: 'notification.js'
	}

];

/* 历史记录 */

var history = {
	'0.6.9.0': [
		'新增 "有爱饭友列表" 插件',
		'多处样式更新和 bugs 修正'
	],
	'0.6.8.2': [
		'修正 "浮动输入框" 插件拖拽图片上传功能',
		'细节更新'
	],
	'0.6.8.0': [
		'修正部分未读消息不显示的问题',
		'修正 "浮动输入框" 插件开启后不能传图的问题',
		'改进加载方式',
		'新增 "消息批量管理" 插件',
		'"侧栏详细统计信息" 插件添加查看背景图片功能',
		'多处样式更新和 bugs 修正'
	],
	'0.6.7.0': [
		'更换插件加载原理, 提升性能',
		'增加向上滚动滚轮后自动点击 "显示新增 X 条新消息"功能',
		'修正 "侧边详细统计信息" 插件',
		'修正更改设置项后不能及时生效的问题',
		'细节更新'
	],
	'0.6.6.3': [
		'优化 "返回顶部" 功能和页面滚动性能',
		'样式更新',
		'更新 "侧栏统计信息" 插件'
	],
	'0.6.6.0': [
		'新增通知插件 (具体功能见设置页)',
		'更新设置页'
	]
};
