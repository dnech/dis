Ext.ns('App.common.Content');
App.Content =
{
    _contents: [],  // массив контента
	_showlogs: true,
	//_locked: false,
	//x: 5,
	//y: 5,
	
	//--------------------------------------------------------------------------------------------------------------
	//addWin: function(obj, data){
	//	this._windows.push({id: data.sender.id, win: data.sender}); // упаковываю подписчика в массив
	//	this.log('Окна: Объект "'+data.sender.id+'" зарегистрирован (Окон: '+this._windows.length+').');
	//	//this._x = data.sender.x;
	//	//this._y = data.sender.y;
	//},
	
	//delWin: function(obj, data){
	//	var idx = this.getIdxByWin(data.sender)
	//	if 	(idx > -1) {	//this._activehistory.pop(data.sender);
	//		this._windows.splice(idx,1);
	//		this.log('Окна: Объект "'+data.sender.id+'" удален (Окон: '+this._windows.length+').');
	//		if (!this._locked) {this.toFront();}
	//	}
	//},
	
	//actWin: function(obj, data){
	//	if (!this._locked) {
	//		var idx = this.getIdxByWin(data.sender);
	//		if (idx>-1) {
	//			var tmp = this._windows[idx].win;
	//			this._windows.splice(idx,1);
	//			this._windows.push({id: tmp.id, win: tmp});
	//			this.log('Окна: Объект "'+data.sender.id+'" активирован.');
	//		}	
	//	}
	//},
	
	count: function(){
		return this._contents.length;
	},
	
	//--------------------------------------------------------------------------------------------------------------
	//getIdxByWin: function(obj){
	//	var answer = -1;
	//	for (var i = 0; i < this._windows.length; i++ ) {
	//		if (this._windows[i].id == obj.id) {
	//			answer = i;
	//		}
    //    }
	//	return answer;
	//},
	
	//getConByName: function(name){
	//	var answer;
	//	for (var i = 0; i < this._contents.length; i++ ) {
	//		if (this._contents[i].win.name == name) {
	//			answer = this._contents[i].win;
	//		}
    //    }
	//	return answer;
	//},
	
	//getWinById: function(id){
	//	var answer;
	//	for (var i = 0; i < this._windows.length; i++ ) {
	//		if (this._windows[i].win.id == id) {
	//			answer = this._windows[i].win;
	//		}
    //    }
	//	return answer;
	//},
	
	//--------------------------------------------------------------------------------------------------------------
	//allClose: function(obj, data){
	//	this.log('Окна: Закрываем все окна.');
	//	for (var i = this._windows.length; i > 0 ; i-- ) {
	//		this._windows[i-1].win.close();
    //    }	
	//},
	
	//allMinimize: function(obj, data){
	//	this._locked = true;
	//	this.log('Окна: Скрываем все окна.');
	//	for (var i = 0; i < this._windows.length; i++ ) {
	//		this._windows[i].win.minimize();
    //    }
	//	this._locked = false;		
	//},
	
	//allShow: function(obj, data){
	//	this._locked = true;
	//	this.log('Окна: Отображаем все окна.');
	//	for (var i = 0; i < this._windows.length; i++ ) {
	//		this._windows[i].win.setVisible(true);
    //    }
	//	this._locked = false;
	//	this.toFront();		
	//},
	
	//toFront: function(){
	//	this.log('Окна: На передний план активное окно.');
	//	for (var i = this._windows.length; i > 0 ; i-- ) {
	//		if (this._windows[i-1].win.isVisible()) {
	//			this._windows[i-1].win.toFront();
	//			break;
	//		}
    //    }	
	//},
	
	//---------------------------------------------------------------------------------------------------------------
	/*
	createWin: function(fname,uname,data){
		var uname = uname || fname;
		var	win = this.getWinByName(uname);
		if (win) {
			win.toFront();
		} else {
			win = Ext.create('App.components.window.WindowClient', {FormName:fname, ItemId: uname, conf:data});			
			if (win.InitFn) {win.InitFn(win);}
			win.show();
		}
		return win;
	},
	*/
	//---------------------------------------------------------------------------------------------------------------
	/*LoadClientWin: function(fname,uname,data){
		var uname = uname || fname;
		var	win = this.getWinByName(uname);
		if (win) {
			win.toFront();
		} else {
			win = Ext.create('App.components.window.WindowClient', {FormName:fname, ItemId: uname, conf:data});			
			if (win.InitFn) {win.InitFn(win);}
			win.show();
		}
		return win;
	},
	*/
	//---------------------------------------------------------------------------------------------------------------
	/*LoadServerWin: function(src, name, parent, conf){
		var name = name || src,
			win  = this.getWinByName(name);
		if (win) {
			win.toFront();
		} else {
			win = Ext.create('App.components.window.WindowServer', {src: src, name:name, parent:parent, conf: conf});
			win.show();
			win.loader.load();
		}
		return win;
	},
	*/
	//---------------------------------------------------------------------------------------------------------------
	LoadDb: function(target, name){
		var data = App.Meta.getWindow(name);
		if (data){
			var str = data.toString(); //Buffer To String
			str = str.replace(new RegExp("%ContainerId%",'g'), target);
			try {
				(new Function(str))();
				return target;
			} catch (err) {
				Ext.Msg.alert({
					title:'Ошибка содержимого '+name+'!',
					msg: err.name+'<br>'+err.message,
					icon: Ext.MessageBox.WARNING,
					buttons: Ext.Msg.OK,
					modal: true,
					fn: function(btn) {
						//me.close();
					},
				});	
				this.log('Контент: Загрузка Db контент, ошибка контента "'+name+'" не найден');
				return undefined;
			}	
		} else {
			this.log('Контент: Загрузка Db контент, контент "'+name+'" не найден');
			return undefined;
		}
	},
	
	// Вывод лога
	log:function(msg){
		if (this._showlogs) {
			console.log(msg);
		}
	},	
}