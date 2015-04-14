Ext.define('App.store.Windows', {
    extend:		'Ext.data.Store',
    requires:	'App.model.Windows',
    model: 		'App.model.Windows',
	autoLoad:		false,
    autoSync:		false,
    autoDestroy:	false
});