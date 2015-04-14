Ext.define('App.store.Constants', {
    extend:			'Ext.data.Store',
    requires:		'App.model.Constants',
    model: 			'App.model.Constants',
	autoLoad:		false,
    autoSync:		false,
    autoDestroy:	false
});