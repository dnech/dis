Ext.define('App.view.User.Viewport', {
    extend: 'Ext.Viewport',    
    layout: 'fit',
	border: false,
	bodyStyle: {"background-color":"#30353c"},
    requires: [
        'Ext.data.*',
		'Ext.chart.*',
		'App.view.User.Top',
		'App.view.User.Center',
    ],
	
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            items: [
                {
					xtype: 'panel',
                    border: false,
					id    : 'viewport',
					bodyStyle:{"background-color":"#30353c"},
					layout: {
						type: 'border',
						//padding: 1,
					},
					defaults: {
						//	split: true
						//border: true,
					},
                    
                    dockedItems: [
                        
                    ],
                    
                    items: [
						Ext.create('App.view.User.Top'),
						Ext.create('App.view.User.Center'),
                    ]
                }
            ]
        });
                
        me.callParent(arguments);
    }
});