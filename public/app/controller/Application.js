Ext.define('App.controller.Application', {
	extend: 'Ext.app.Controller',
	//requires: [
	//	'App.common.Auth',
	//	'App.common.Util',
    //    'App.common.Event',
	//	'App.common.Window',
	//	'App.common.Errors',
    //],
	
	stores: [
		'Constants',
		'Modules',
		'Tables',
		'Windows',
		'Settings'
	],
	
	init: function() {
		var me = this;
		
		App.RunApplication = function(){

            /************************************/
            /* G L O B A L   M E T A  P R O X Y */
            /************************************/
            /*
			App.ProxyMeta = function(meta){
                return new Ext.data.proxy.Rest({
                    url: App.CONST.api.meta+meta,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    },
                    listeners: {
                        exception: function( obj, response, operation, eOpts ){
                            var errorData = Ext.JSON.decode(response.responseText);
                            console.error('Error ProxyMeta', errorData, operation);
                            Ext.Msg.alert('Error ProxyMeta', errorData.type+'<br>'+errorData.message, function(){
                                if (errorData.type === 'session') {App.LogOut();}
                            });

                        }
                    }
                });
            };
			*/
            /*********************************************/
            /* G L O B A L   S E T T I N G S   P R O X Y */
            /*********************************************/
            /*App.ProxySettings = function(){
                return new Ext.data.proxy.Rest({
                    url: App.CONST.api.settings,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    },
                    listeners: {
                        exception: function( obj, response, operation, eOpts ){
                            var errorData = Ext.JSON.decode(response.responseText);
                            console.error('Error ProxySettings', errorData, operation);
                            Ext.Msg.alert('Error ProxySettings', errorData.type+'<br>'+errorData.message, function(){
                                if (errorData.type === 'session') {App.LogOut();}
                            });

                        }
                    }
                });
            };*/

            /********************************/
            /* G L O B A L   D B  P R O X Y */
            /********************************/
            App.ProxyDB = function(table){
                return new Ext.data.proxy.Rest({
                    url: App.CONST.api.db+table,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    },
                    listeners: {
                        exception: function( obj, response, operation, eOpts ){
                            App.Error.Proxy('DB:'+table, obj, response, operation, eOpts);
                        }
                    }
                });
            };



            /*****************************/
            /* G L O B A L   S T O R E S */
            /*****************************/
            App.Meta = {
                Constants:	Ext.create('App.store.Constants'),
                Modules:	Ext.create('App.store.Modules'),
                Tables:		Ext.create('App.store.Tables'),
                Windows:	Ext.create('App.store.Windows'),
                Settings:	Ext.create('App.store.Settings'),
                load: function(cb){
                    var me = this;
                    me.Constants.load(function(){
                        me.Modules.load(function(){
                            me.Tables.load(function(){
                                me.Windows.load(function(){
                                    me.Settings.load(function(){
                                        if (typeof cb === 'function') {cb();}
                                    });
                                });
                            });
                        });
                    });
                },
                getConstant: function(name){
                    var me = this;
                    var record = me.Constants.findRecord('name', name);
                    if (record) {
                        return App.Util.Utf8.decode(App.Util.base64.decode(record.data.data));
                    } else {return undefined;}
                },
                getModule: function(name){
                    var me = this;
                    var record = me.Modules.findRecord('name', name);
                    if (record) {
                        return App.Util.Utf8.decode(App.Util.base64.decode(record.data.data));
                    } else {return undefined;}
                },
                getTable: function(name, context){
					var me = this;
                    var record = me.Tables.findRecord('name', name);
                    if (record) {
                        try {
							context = context ? context : this;
							return (new Function('ThisWin', App.Util.Utf8.decode(App.Util.base64.decode(record.data.data))))(context);
						} catch(err) {
							console.log('Error get Meta Tables', name, err.message);
						}
                    } else {return undefined;}
                },
                getWindow: function(name){
                    var me = this;
                    var record = me.Windows.findRecord('name', name);
                    if (record) {
                        return App.Util.Utf8.decode(App.Util.base64.decode(record.data.data));
                    } else {return undefined;}
                },
                getSetting: function(name){
                    var me = this;
                    var record = me.Settings.findRecord('name', name);
                    if (record) {
                        return App.Util.Utf8.decode(App.Util.base64.decode(record.data.data));
                    } else {return undefined;}
                },
                setSetting: function(name, value){
                    var me = this;
                    var rec = me.Settings.findRecord('name', name);
                    if (rec) {
                        rec.set('data', App.Util.base64.encode(App.Util.Utf8.encode(value)));
                        rec.save({
                            success: function(batch, options){
                                me.Settings.load();
                            }
                        });
                    } else {
                        var data = {
                            name: name,
                            data: App.Util.base64.encode(App.Util.Utf8.encode(value))
                        };
                        var record = new me.Settings.model(data);
                        me.Settings.add(record);
                        me.Settings.sync({
                            success: function(batch, options){
                                me.Settings.load();
                            }
                        });
                    }
                }

            };

            
            App.Include = function(name, hideerror){
                var error = function(modul, message){
                    if (!hideerror){
                        App.Error.Msg('Ошибка загрузки модуля!', 'Модуль: '+modul+'<br>'+message, function() {
                            App.Window.LoadServerWin('SysDesignerConstants');
                        });
                    }
                };

                try {
                    var module = App.Meta.getModule(name);
                    if (module) {
                        (new Function(module))();
                    } else {
                        error(name, 'Не найден');
                    }

                } catch (err) {
                    error(name, 'Ошибка: '+err.name+'<br>Описание: '+err.message);
                }
            };


            // LOAD APP MODULE
            App.Meta.load(function(){
                Ext.get('logo_loading').remove();

                var view = (App.CONST.Me.config.view)?App.CONST.Me.config.view:App.CONST.view;

                Ext.create('App.view.'+view);

                var module = App.Meta.getConstant('AppModule');
                if (module) {
                    (new Function(module))();
                } else {
                    App.Error.Msg('Ошибка загрузки основного модуля!', 'Модуль: "AppModule"<br>Описание: Не найден');
                }
            });
        };
	}	
})