Ext.ns('App.common.Auth');
App.Auth = 
{
	//--------------------------------------------------------------
	ShowLogIn: function(){
			Ext.get('logo_loading').remove();
            Ext.create('App.view.Login');		
	},
	//--------------------------------------------------------------
	LogIn: function(user){
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
		
	},
		
	//--------------------------------------------------------------
	LogOut: function(){
		Ext.util.Cookies.clear('DIS_SESSION_KEY');
		location.reload();
	}
}