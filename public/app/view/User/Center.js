Ext.define('App.view.User.Center', {
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
					title: 'Оперативная панель',
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
					title: 'Справочники',
					icon: 'images/ico/table16.png',
					layout: 'fit',
					items: {
						id: 'contentSpravochniki',
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
				App.Content.LoadDb('contentDashboard',	  'kar.User.Dashboard');
				App.Content.LoadDb('contentIn', 		  'kar.Zakaz.List_SQL');
				App.Content.LoadDb('contentSpravochniki', 'kar.User.Spravochniki');
				App.Content.LoadDb('contentOtchet',		  'kar.User.Otchet');
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