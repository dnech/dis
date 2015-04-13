Ext.application({
    requires: [
				'Ext.grid.*',
				'Ext.window.Window',
				'Ext.util.Point',
				'App.view.Login',
				'App.view.Viewport',
				'App.components.data.Store',
				'App.components.data.Grid',
                'App.components.aceeditor.WithToolbar',
			//	'App.components.window.WindowServer'
			//	'Ext.util.base64',
			//	'Ext.PagingToolbar',
			//	'Ext.container.Viewport',
			//	'Ext.layout.container.*',
			//	'Ext.state.*',
			//	'Ext.data.*',
			//	'Ext.ux.window.*',
			],
			
    name: 'App',
    appFolder: 'app',
		
	launch: function() {

		App.CONST = {
            version:	'0.2',
			view:	    'Viewport',
            extdir:		'ext-5.1/',
			locale:		'ru',
			theme:		'classic',
			timezone:	'+07:00',
			api: {
				login: 	'/api/auth/login',
				logout: '/api/auth/logout'
			}
		};

		Ext.Ajax.timeout = 30000; // 30 seconds
		
		Ext.Loader.setConfig({enabled: true});
		Ext.Loader.setPath('Ext.ux', App.CONST.extdir + 'src/ux');

		Ext.QuickTips.init();
		Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider')); 

		/*****************************************************/
		/* AUTORIZED */
		if (Ext.util.Cookies.get('DIS_SESSION_KEY') === null){
			Ext.get('logo_loading').remove();
            Ext.create('App.view.Login');
		} else {
			Ext.Ajax.request({
				url: App.CONST.api.login,
				method: 'POST',
				params: {
					ssid: Ext.util.Cookies.get('DIS_SESSION_KEY')
				},
				failure: function(response, opts) {
					Ext.Msg.alert('Error', response.status);
				},
				success: function(response){
					var resp = Ext.JSON.decode(response.responseText);
					if (!resp.success) {
						App.LogOut();
					} else {
						App.LogIn(resp.data);
                        var locale = (App.CONST.Me.config.locale)?App.CONST.Me.config.locale:App.CONST.locale;
                        var localeurl = Ext.util.Format.format(App.CONST.extdir + 'locale/ext-locale-{0}-debug.js', locale);

                        var theme = (App.CONST.Me.config.theme)?App.CONST.Me.config.theme:App.CONST.theme;

                        Ext.Loader.loadScript({
                                url: localeurl,
                                onError: function(){Ext.Msg.alert('Error', 'Error load "'+locale+'" locale.')},
                                onLoad:  function(){
                                    App.LoadTheme(theme, App.RunApplication, function(err){
                                        Ext.Msg.alert('Error', 'Error load theme "'+theme+'.'+err+'".');
                                    });
                                }
                            }
                        );

					}
				}
			});							
		}
	},
	controllers: [
		'Application', /*'DbActions',*/ 'WinActions'
    ],
	
	autoCreateViewport: false,
});