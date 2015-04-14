Ext.define('App.store.Tables', {
    extend:		'Ext.data.Store',
    requires:	'App.model.Tables',
    model: 		'App.model.Tables',
	autoLoad:		false,
    autoSync:		false,
    autoDestroy:	false
});