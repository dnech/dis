Ext.define('App.store.Settings', {
    extend:		'Ext.data.Store',
    requires:	'App.model.Settings',
    model: 		'App.model.Settings',
	autoLoad:		false,
    autoSync:		false,
    autoDestroy:	false
});