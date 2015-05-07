Ext.define('App.view.Login', {
    extend: 'Ext.Viewport',    
    layout: 'fit',
    requires: [],
    				
    initComponent: function() {
        var me = this;
        
		me.sendForm = function(form){
			if (form.isValid()) {
				var val = form.getValues();
				Ext.Ajax.request({
					url: App.CONST.api.login,
					method: 'POST',
					params: {
						login: val.user,
						pass: val.pass
					},
					success: function(response){
						var resp = Ext.JSON.decode(response.responseText);
						if (resp.success) {
							Ext.util.Cookies.set('DIS_SESSION_KEY', resp.data.ssid);
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
		};
		
		var LoginWindow = Ext.create('Ext.Window', {
						icon: 'images/ico/key16.png',
						title: 'Dynamic Integration System',
						width: 350,
						//height: 185,
						frame: false,
						layout: 'fit',
						closable: false,
						border: false,
						items: [Ext.create('Ext.form.Panel', {
							frame: true,
                            bodyPadding: '5 5 5',
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							items:[
								{
									id: 'UserField',
									xtype: 'textfield',
									allowBlank: false,
									fieldLabel: 'Пользователь',
									name: 'user',
									value: Ext.util.Cookies.get('DIS_LOGIN_USER'),
									emptyText: 'пользователь',
									listeners: {
									  afterrender: function(field) {
										if (Ext.getCmp('UserField').getValue() === ''){
											Ext.getCmp('UserField').focus();
										}
									  }
									}
								},{
									id: 'PassField',
									xtype: 'textfield',
									allowBlank: false,
									fieldLabel: 'Пароль',
									name: 'pass',
									emptyText: 'пароль',
									inputType: 'password',
									listeners: {
									  specialkey: function(f,e){
										if (e.getKey() == e.ENTER) {
											var form = this.up('window').down('form').getForm();
											me.sendForm(form);
										}
									  },
									  afterrender: function(field) {
										if (Ext.getCmp('UserField').getValue() !== ''){
											Ext.getCmp('PassField').focus();
										}
									  }
									}
								},{
									xtype: 'panel',
									frame: true,
									bodyPadding: '5 5 5',
									height: 58,
									html: '<div align="right"><img height="48px" width="96px" src="images/logoSmall.jpg"><img height="48px" width="100px" src="images/extjs.png"></img></div>'
									//html: '<div align="right"><img height="48px" width="96px" src="images/logoSmall.jpg"><img height="48px" width="48px" src="images/html5.png"></img><img height="48px" width="48px" src="images/io.png"></img><img height="48px" width="100px" src="images/extjs.png"></img></div>'
								},
							],
							//listeners: {
							//	show: function(field) {
							//		field.focus(true, 100);
							//	}
							//}
						})],
						//buttonAlign: 'center',
						buttons: [{
							text: 'Войти',
							handler: function() {
								var form = this.up('window').down('form').getForm();
								me.sendForm(form);
							}
						}],
					});
					
		LoginWindow.show().alignTo(Ext.getBody(), 'c-c', [0, -100]);
	
        Ext.apply(me, {
            items: [Ext.create('Ext.panel.Panel', {
				layout: 'fit',
				border: false,
				items: [LoginWindow],
				listeners:{
					resize: function( obj, width, height, oldWidth, oldHeight, eOpts ) {
						LoginWindow.alignTo(Ext.getBody(), 'c-c', [0, -100]);
					}
				}
			})],
        });
                
        me.callParent(arguments);
    }
});