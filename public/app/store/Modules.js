Ext.define('App.store.Modules', {
    extend:		'Ext.data.Store',
    requires:	'App.model.Modules',
    model: 		'App.model.Modules',
	autoLoad:		false,
    autoSync:		false,
    autoDestroy:	false
});