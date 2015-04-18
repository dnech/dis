Ext.application({
    requires: [
				//'Ext.grid.*',
				//'Ext.window.Window',
				//'Ext.util.Point',
				'Ext.direct.*',
				'App.common.Util',
				'App.common.Event',
				'App.common.Window',
				'App.common.Errors',
				'App.common.Auth',
				'App.common.Locale',
				'App.common.Theme',				
				'App.view.Login',
				'App.view.Viewport',
				'App.components.data.Store',
				'App.components.data.Grid',
                'App.components.aceeditor.WithToolbar',
				'App.components.window.WindowServer',
				'App.components.window.WindowDb'

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
			App.Auth.ShowLogIn();
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
						App.Auth.LogOut();
					} else {
						App.Auth.LogIn(resp.data);
                        App.Locale.load(function(){
							App.Theme.load(App.RunApplication);
						});
					}
				}
			});							
		}
	},
	controllers: [
		'WinActions', 'Application'
    ],
	
	autoCreateViewport: false,
});