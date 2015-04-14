Ext.define('App.controller.WinActions', {
	extend: 'Ext.app.Controller',
	
	//requires: [
	//	'App.common.Util',
    //   'App.common.Event',
	//	'App.common.Window',
	//	'App.common.Errors',
    //],
	
	init: function() {
		var me = this;
		
		App.Event.subscribe('win_init',			me);
		App.Event.subscribe('win_activate',		me);
		App.Event.subscribe('win_close',		me);
		App.Event.subscribe('win_all_close',	me);	
		App.Event.subscribe('win_all_minimize',	me);
		App.Event.subscribe('win_all_show',		me);
	},
	 
	listeners: {
		_win_init: function(obj, data){
			App.Window.addWin(obj, data);
		},
		_win_activate: function(obj, data){
			App.Window.actWin(obj, data);
		},
		_win_close: function(obj, data){
			App.Window.delWin(obj, data);
		},
		_win_all_close: function(obj, data){
			App.Window.allClose(obj, data);
		},
		_win_all_minimize: function(obj, data){
			App.Window.allMinimize(obj, data);
		},
		_win_all_show: function(obj, data){
			App.Window.allShow(obj, data);
		},
	},
	
})