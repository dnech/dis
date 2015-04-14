Ext.ns('App.common.Theme');
App.Theme = 
{
	load: function(ok) {
        var theme = (App.CONST.Me.config.theme)?App.CONST.Me.config.theme:App.CONST.theme,
			themecss = Ext.util.Format.format(App.CONST.extdir + 'theme/{0}/resources/ext-theme-{0}-all.css', theme),
			themejs = Ext.util.Format.format(App.CONST.extdir + 'theme/{0}/ext-theme-{0}-debug.js', theme);

         Ext.Loader.loadScript({
            url: themecss,
            onError: function () {
				App.Error.Msg('Error', 'Error load theme "'+theme+'.css".');
			},
            onLoad: function () {
                Ext.Loader.loadScript({
                    url: themejs,
                    onError: function () {
						App.Error.Msg('Error', 'Error load theme "'+theme+'.js".');
					},
                    onLoad: ok
                });
            }
        });
    }
}