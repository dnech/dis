//------------------------------------------------------------------------------
//
//        			  ШАБЛОН ОКОН ЗАГРУЖАЕМЫХ С СЕРВЕРА
//
//------------------------------------------------------------------------------
Ext.define('App.components.window.WindowServer', {
    extend: 'Ext.window.Window',
	alias	: 'widget.TWindowServer',
	requires: ['Ext.window.MessageBox'],
	
	//Параметры по-умолчанию 1
	constrain:		true,			//Ограничивать перемещения областью панели родителя
	border:			false,			//Бордюр
	minimizable: 	true,			//Кнопка минимизации
	maximizable: 	true,			//Кнопка максимизации
	title: 			'Window',		//Заголовок по умолчанию
    layout:			'fit',			//Контент растянуть на всю область		
	stateful:		true,			//Запоминать положение и размер окна
	Changed:        false,
	
	StateUsed: 		false, 
	x: 				10,
	y: 				10,
	width: 			180,
	height: 		80,
	
	loader: 		{
		url : 'content/', //App.CONST.api.res+
		scope:   this.Win,
		autoLoad: true,
		scripts: true,
		nocache: false,
		timeout: 10000,
		loadMask: true,
		//autoLoad : true, // important
		renderer: 'html',
        params: {
				'src' : '',
				'id': '',
			},
		//success: function(el,response,opts) {
        //        console.log('success');
		//		//if (this.Win.InitFn) {this.Win.InitFn(this.Win);}
        //    },
        //failure:function(el,response,opts) {
        //        console.log('failure');
        //    },
		listeners: { 
			//beforeload: function(obj,options,eOpts){
			//	console.log('beforeload');
			//	//obj.Win.setTitle('Загрузка...');
			//},
			exception:	function(obj,response,options,eOpts){
				//console.log('exception "'+obj.Win.name+'" '+response.statusText); 
				//obj.Win.close();
				Ext.Msg.alert({
					title:'Ошибка!',
                    msg:'Ошибка загрузки формы: '+response.statusText,
                    icon: Ext.MessageBox.WARNING,    // иконка мб {ERROR,INFO,QUESTION,WARNING}
                    buttons: Ext.Msg.OK,
					modal: true,
					fn: function(btn) {
						obj.Win.close();
					}
                });	
			},
			load: function(obj,response,options,eOpts){
				//console.log('load form', obj.Win.name, obj.Win.url);
				var data = response.responseText;
				
				var me = this;
				var str = response.responseText;
				//str = str.replace(new RegExp("<script>",'g'), '');
				//str = str.replace(new RegExp("</script>",'g'), '');
				str = str.replace(new RegExp("%ContainerId%",'g'), me.id);

				try {
					(new Function(str))();
				} catch (err) {
					Ext.Msg.alert({
						title:'Ошибка окна '+me.Win.name+'!',
						msg: err.name+'<br>'+err.message,
						icon: Ext.MessageBox.WARNING,
						buttons: Ext.Msg.OK,
						modal: true,
						fn: function(btn) {
							me.Win.close();
						},
					});
					
					return false;
				}
		
				
				//obj.LoadMask.hide();
				//obj.Win.setTitle('load');
				//if (App.win_id_init) {App.win_id_init(obj.Win);}
			},
		},		
    },
	
		
    initComponent: function() {
        var me = this;
	
		//Параметры по-умолчанию 3 после переданных при расширении от 'App.common.Window'
		me.name			= me.name || me.id;	//Уникальное имя для поиска формы				
		me.ToRender		= 'centralPanel';		//Где будем прорисовывать окно
		me.BtnRender	= true; 
		me.stateId		= me.src;			//Имя под которым будет храниться информация о положении и размере окна
		
		//me.myItems = [];
		
		me.loader.url = App.CONST.api.res+'content/';
		
		me.loader.params.src = me.src;
		me.loader.params.id  = me.id;

		//---------------AJAX----------
		me.loader.Win = me; // Передаем в лоадер ссылку на наше окно

		//Переопределение параметров из conf
		Ext.apply(me, me.conf);
	
		
		//------------------------------------------------------------------------------------------------------------------------------
		//
		//             КНОПКА ТУЛБАРА
		//
		//------------------------------------------------------------------------------------------------------------------------------
		// Создаем кнопку в тулбаре
		me.linkButton = Ext.create('Ext.Button', {
						linkWindows: me,
						minWidth: 120,
						maxWidth: 120,
						icon: me.icon,
						text: me.title,
						listeners: {
						  afterrender: function() {
							me.linkButton.tip = Ext.create('Ext.tip.ToolTip',{
							  target: me.linkButton.el.id,
							  html: me.linkButton.text,
							  anchor: 'top'
							});
						  }
						},
						handler: function() {
							this.linkWindows.setVisible(true);
							this.linkWindows.toFront();
							var oldBack = this.linkWindows.getEl().getStyle('background-color');
							this.linkWindows.getEl().animate({
								duration: 100,
								to: {
									backgroundColor: '#aaf'  //red
								},
							}).animate({
								to: {
									backgroundColor: oldBack 
								},
							});
						}
					});
		
		// Если получено сообщение о активации окна то активируем и кнопку
		App.Event.subscribe('win_activate',	me.linkButton);
		me.linkButton.on('_win_activate', function(obj, data) {
			this.toggle(false);
		});
		
			
		//------------------------------------------------------------------------------------------------------------------------------
		//
		//               ОТРАБАТЫВАЕМ СООБЩЕНИЯ
		//
		//------------------------------------------------------------------------------------------------------------------------------
		
		me.on({
			// Когда окно выбрали
			activate: function(win, options){
				App.Event.fire('win_activate',{sender:win, options: options});
				win.linkButton.toggle(true);
			},
			// Когда окно свернули
			minimize: function(win, options){
				//App.Event.fire('win_minimize',{sender:win, options: options});
				win.setVisible(false);
				//win.linkButton.toggle(false);
			},
			// Когда окно уничтожили
			destroy: function(win, options){
				win.linkButton.destroy();
				App.Event.fire('win_close',{sender:win, options: options});
			},
			titlechange: function(win, title){
				win.linkButton.setText(title);
				me.linkButton.tip.html = title;
			},
			iconchange: function(p, newIconCls, oldIconCls, eOpts){
				me.linkButton.setIcon(newIconCls);
			},
			staterestore: function(obj, state, eOpts ){
				//console.log('восстановили состояние');
			},
			scope: this
		});
		
		
		//me.buttons = [];
		
		me.tools = [/*{
			type:'refresh',
			tooltip: 'Обновить форму',
			handler: function(event, toolEl, panel){
				//debugger;
				//me.dockedItems.items[1].items.items = [];
				me.loader.load();
			}
		},*/
		/*{
			type:'help',
			tooltip: 'Помощь',
			handler: function(event, toolEl, panel){
				// show help here
			}
		}*/];
		
		//------------------------------------------------------------------------------------------------------------------------------
		//
		//          ЗАВЕРШАЮЩАЯ ОТРИСОВКА
		//
		//------------------------------------------------------------------------------------------------------------------------------
		if (Ext.getCmp(me.ToRender)) {
			if (me.BtnRender){
				Ext.getCmp(me.ToRender).getDockedItems()[0].add(me.linkButton);
			}	
			Ext.getCmp(me.ToRender).add(me);
		}
		
		App.components.window.WindowServer.superclass.initComponent.apply(me, arguments);
		App.Event.fire('win_init',{sender:me});
    },
	
	

	// fix
	getState: function() {
                var me = this,
				state = me.callSuper(arguments) || {},
                    maximized = !!me.maximized,
                    ghostBox = me.ghostBox,
                    pos;

				//console.log('получили состояние');                
                
				state.maximized = maximized;
                if (maximized) {
                    pos = me.restorePos;
                } else if (ghostBox) {
                    // If we're animating a show, it will be from offscreen, so
                    // grab the position from the final box
                    pos = [ghostBox.x, ghostBox.y];

                    // <WestyFix>
                    var isContainedFloater = me.isContainedFloater(),
                        floatParentBox;

                    if (isContainedFloater) {
                        floatParentBox = me.floatParent.getTargetEl().getViewRegion();
                        pos[0] -= floatParentBox.left;
                        pos[1] -= floatParentBox.top;
                    }
                    // </WestyFix>
                } else {
                    // <WestyFix>
                    pos = me.getPosition(true);
                    // </WestyFix>

                    //if (window.console) {
                    //    window.console.log('Non-ghostbox pos:' + pos[0] + ', ' + pos[1]);
                    //}
                }
				
                if (me.autoPos) {
					App.Window.x = App.Window.x + 24;
					App.Window.y = App.Window.y + 24;
					pos[0] = App.Window.x;
                    pos[1] = App.Window.y;
				}
				
				Ext.apply(state, {
                    size: maximized ? me.restoreSize : me.getSize(),
                    pos: pos
                });
				
				//if  = true;
				me.StateUsed = ((state.width != 180) || (state.height != 80));
				//height: 		80,
                
				return state;
    },
	
});