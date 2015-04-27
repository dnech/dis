Ext.define('App.view.Director.Viewport', {
    extend: 'Ext.Viewport',    
    layout: 'fit',
	border: false,
	bodyStyle: {"background-color":"#30353c"},
    requires: [
        'App.view.Director.Top',
		'App.view.Director.Center',
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
						Ext.create('App.view.Director.Top'),
						Ext.create('App.view.Director.Center'),
                    ]
                }
            ]
        });
                
        me.callParent(arguments);
    }
});