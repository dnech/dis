Ext.ns('App.common.Locale');
App.Locale = 
{
	load: function(ok){
		var locale = (App.CONST.Me.config.locale)?App.CONST.Me.config.locale:App.CONST.locale;
        var localeurl = Ext.util.Format.format(App.CONST.extdir + 'locale/ext-locale-{0}-debug.js', locale);
		Ext.Loader.loadScript({
            url: localeurl,
            onError: function(){
				App.Error.Msg('Error', 'Error load "'+locale+'" locale.');
			},
            onLoad:  ok
        });
	},
}