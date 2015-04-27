Ext.define('App.view.Director.Center', {
    extend: 'Ext.Panel', 
	
	requires: [
        'App.common.Window',
    ],
	
	id : 'centralPanel',
	
	border: false,
	region: 'center',
	padding: -1,
	layout: 'fit',
	bodyStyle:{"background-color":"#c5c5c5"},//#30353c
	
    initComponent: function() {
		var me = this;
		
		Ext.apply(me, {
			items: [Ext.create('Ext.tab.Panel', {
				tabPosition: 'left',
				tabRotation: 0,
				border: false,
				region: 'center',
				padding: 0,
				layout: 'fit',
				
				plain: true,
				defaults: {
					bodyPadding: 10,
					scrollable: true,
				},
				items: [{
					textAlign: 'left',
					iconAlign: 'left',
					border: false,
					title: 'Dashboard',
					icon: 'images/ico/16/action_log.png',
					layout: 'fit',
					scrollable: true,
					items: {
						id: 'contentDashboard',
						layout: 'fit',
						border: false,
					}
				},{
					textAlign: 'left',
					iconAlign: 'left',
					border: false,
					title: 'Затраты',
					icon: 'images/ico/16/coins_delete.png',
					layout: 'fit',
					scrollable: true,
					items: {
						id: 'contentOut',
						layout: 'fit',
						border: false,
					}
				},{
					textAlign: 'left',
					iconAlign: 'left',
					title: 'Заказы',
					icon: 'images/ico/16/coins_add.png',
					layout: 'fit',
					items: {
						id: 'contentIn',
						layout: 'fit',
						border: false,
					}
				},{
					textAlign: 'left',
					iconAlign: 'left',
					title: 'Отчеты',
					icon: 'images/ico/16/chart_bar.png',
					layout: 'fit',
					items: {
						id: 'contentOtchet',
						layout: 'fit',
						border: false,
					}
				}],
		
		listeners: {	
			render: function( obj, eOpts ){
				//Ext.getCmp('contentDashboard').removeAll(true);
				App.Content.LoadDb('contentDashboard',	'kar.cost_item.List');
				App.Content.LoadDb('contentOut',		'kar.cost.List');
				App.Content.LoadDb('contentIn', 		'kar.Zakaz.List_SQL');
				App.Content.LoadDb('contentOtchet',		'sys.User.List');
			}
		},
	})],
		});
		
		me.bbar = Ext.create('Ext.toolbar.Toolbar', {
			enableOverflow    : true,  
			items: []
		});
		
        me.callParent(arguments);
    }
});