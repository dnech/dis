Ext.define('App.view.Director.Top', {
    extend: 'Ext.Panel',
	region: 'north',
	//padding: 1,
    border: false,
	layout: 'anchor',
	//bodyStyle:{"background-color":"#30353c"},
	
    initComponent: function() {
		var me = this;
		
	    //Ext.applyIf(me, {
        //    html: '<h1>Конфигуратор</h1>'
        //});
		
		var headlogo = App.view.Top.headlogo = Ext.create('Ext.panel.Panel', { 
			height: 48,
			padding: 5,
			border: false,
			flex: 1,
			//bodyStyle:{"background-color":"#30353c"},
			//html: 'Караван'
			html: '<img height="40px" width="80px" src="images/logoSmall.jpg">'
		});
		
		var headuser = App.view.Top.headuser = Ext.create('Ext.toolbar.Toolbar', { 
			height: 48,
			padding: 5,
			border: false,
			items: [
					Ext.create('Ext.Button', {
						text: App.CONST.Me.name+' ('+App.CONST.Me.role+')',
						icon: 'images/ico/user16.png',
						menu: {
							xtype: 'menu',
							items: [
								Ext.create('Ext.Button', {
									text: 'Выход',
									icon: 'images/ico/user16.png',
									handler: function() {
										Ext.Ajax.request({
											url: App.CONST.api.logout,
											method: 'POST',
											params: {
												ssid: App.CONST.Me.ssid
											},
											success: function(response){
												var resp = Ext.JSON.decode(response.responseText);
												if (resp.success) {
													Ext.util.Cookies.clear('DIS_SESSION_KEY');
													location.reload();
												} else {
													Ext.Msg.alert('Error',resp.type+'<br>'+resp.message);
												}
											},
											failure: function(response, opts) {
												Ext.Msg.alert('Error', response.status);
											}
										});
									}
								})
							]
						}
					}),
				]
		});

		me.items = [{
				xtype:'panel',
				border: false,
				layout: 'hbox',
				//bodyStyle:{"background-color":"#30353c"},
				items: [headlogo,  headuser]
				
			}];
                
        me.callParent(arguments);
    }
});