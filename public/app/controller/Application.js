Ext.define('App.controller.Application', {
	extend: 'Ext.app.Controller',
	stores: ['Constants', 'Modules', 'Tables', 'Windows', 'Settings'],
	init: function() {
		var me = this;
		
		App.LogIn = function(user){
			Ext.util.Cookies.set('DIS_SESSION_KEY', user.ssid);
			
			/***********************************/
			/* U P D A T E   C O N S T A N T S */
			/***********************************/
			App.CONST.Me 			= user;
			App.CONST.api.auth		= '/api/auth/';	
			App.CONST.api.meta		= '/api/'+user.ssid+'/meta/';
			App.CONST.api.settings	= '/api/'+user.ssid+'/settings/';
			App.CONST.api.db		= '/api/'+user.ssid+'/db/';
			App.CONST.api.res		= '/api/'+user.ssid+'/res/';
            try {App.CONST.Me.config = Ext.JSON.decode(App.CONST.Me.config);} catch(err) {}
            try {App.CONST.Me.extend = Ext.JSON.decode(App.CONST.Me.extend);} catch(err) {}
			
			App.model.Constants.getProxy().url	= App.CONST.api.meta + 'constants';
			App.model.Modules.getProxy().url	= App.CONST.api.meta + 'modules';
			App.model.Tables.getProxy().url		= App.CONST.api.meta + 'tables';
			App.model.Windows.getProxy().url	= App.CONST.api.meta + 'windows';
			App.model.Settings.getProxy().url	= App.CONST.api.meta + 'settings';
			
		};
		
		
		
		App.LogOut = function(){
			Ext.util.Cookies.clear('DIS_SESSION_KEY');
			location.reload();
		};

        App.LoadTheme = function(theme, ok, err) {
            var themecss = Ext.util.Format.format(App.CONST.extdir + 'theme/{0}/resources/ext-theme-{0}-all.css', theme);
            var themejs = Ext.util.Format.format(App.CONST.extdir + 'theme/{0}/ext-theme-{0}-debug.js', theme);

            Ext.Loader.loadScript({
                url: themecss,
                onError: function () {err('css');},
                onLoad: function () {
                    Ext.Loader.loadScript({
                        url: themejs,
                        onError: function () {err('js');},
                        onLoad: ok
                    });
                }
            });
        };
		
		App.RunApplication = function(){

            /************************************/
            /* G L O B A L   M E T A  P R O X Y */
            /************************************/
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

            /*********************************************/
            /* G L O B A L   S E T T I N G S   P R O X Y */
            /*********************************************/
            App.ProxySettings = function(){
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
            };

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
                            var errorData = Ext.JSON.decode(response.responseText);
                            console.error('Error ProxyDB', errorData, operation);
                            Ext.Msg.alert('Error ProxyDB', errorData.type+'<br>'+errorData.message, function(){
                                if (errorData.type === 'session') {App.LogOut();}
                            });

                        }
                    }
                });
            };



            /*****************************/
            /* G L O B A L   S T O R E S */
            /*****************************/
            App.Meta = {
                Constants: Ext.create('App.store.Constants'),
				//Ext.create('Ext.data.Store', {
                //    fields:  [
                //        {name: 'guid',   type: 'string'	},
                //        {name: 'name',   type: 'string'	},
                //        {name: 'data',   type: 'string'	}
                //    ],
                //    proxy: App.ProxyMeta('constants'),
                //    autoLoad: false,
                //    autoSync: false,
                //    autoDestroy: false
                //}),
                Modules: Ext.create('App.store.Modules'),
				//Ext.create('Ext.data.Store', {
                //    fields:  [
                //        {name: 'guid',   type: 'string'	},
                //        {name: 'name',   type: 'string'	},
                //        {name: 'data',   type: 'string'	}
                //    ],
                //    proxy: App.ProxyMeta('modules'),
                //    autoLoad: false,
                //    autoSync: false,
                //    autoDestroy: false
                //}),
                Tables: Ext.create('App.store.Tables'),
				//Ext.create('Ext.data.Store', {
                //    fields:  [
                //        {name: 'guid',   type: 'string'	},
                //        {name: 'name',   type: 'string'	},
                //        {name: 'title',  type: 'string'	},
                //        {name: 'data',   type: 'string'	}
                //    ],
                //    proxy: App.ProxyMeta('tables'),
                //    autoLoad: false,
                //    autoSync: false,
                //    autoDestroy: false
                //}),
                Windows: Ext.create('App.store.Windows'),
				//Ext.create('Ext.data.Store', {
                //    fields:  [
                //        {name: 'guid',   type: 'string'	},
                //        {name: 'name',   type: 'string'	},
                //        {name: 'title',  type: 'string'	},
                //        {name: 'data',   type: 'string'	}
                //    ],
                //    proxy: App.ProxyMeta('windows'),
                //    autoLoad: false,
                //    autoSync: false,
                //    autoDestroy: false
                //}),
                Settings: Ext.create('App.store.Settings'),
				//Ext.create('Ext.data.Store', {
                //    fields:  [
                //        {name: 'guid',   type: 'string'	},
                //        {name: 'name',   type: 'string'	},
                //        {name: 'data',   type: 'string'	}
                //    ],
                //    proxy: App.ProxySettings(),
                //    autoLoad: false,
                //    autoSync: false,
                //    autoDestroy: false
                //}),
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
                getTable: function(name){
                    var me = this;
                    var record = me.Tables.findRecord('name', name);
                    if (record) {
                        return App.Util.Utf8.decode(App.Util.base64.decode(record.data.data));
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

            /*  */
            App.ErrorMsg = function(title, msg, fn){
                Ext.Msg.alert({
                 title: title,
                 msg: msg,
                 icon: Ext.MessageBox.WARNING,
                 buttons: Ext.Msg.OK,
                 modal: true,
                 fn: fn
                 });
            };

            App.Include = function(name, hideerror){
                var error = function(modul, message){
                    if (!hideerror){
                        App.ErrorMsg('Ошибка загрузки модуля!', 'Модуль: '+modul+'<br>'+message, function() {
                            App.Window.LoadServerWin('SysDesignerConfig');
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
                    App.ErrorMsg('Ошибка загрузки основного модуля!', 'Модуль: "AppModule"<br>Описание: Не найден');
                }
            });
        };
	}	
})