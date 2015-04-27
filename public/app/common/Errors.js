Ext.ns('App.common.Errors');
App.Error = 
{
	Proxy: function(area, obj, response, operation, eOpts ){
		var errorData = Ext.JSON.decode(response.responseText);
		//console.error('Error Proxy '+area, errorData, operation);
		
		if (errorData.type === 'session'){
			var msg = Ext.MessageBox.show({
				title: 'Error Proxy '+area,
				buttons: Ext.MessageBox.YESNO,
				icon: Ext.MessageBox.ERROR,
				msg: errorData.type+'<br>'+errorData.message+'<br>Выполнить повторный вход в систему?',
				fn: function(btn) {
					if (btn == 'yes') {
						App.Auth.LogOut();
					}
				}
			});
			//msg.alignTo(Ext.getBody(), 'c-c'); //По центру окна
		} else {
			Ext.Msg.alert('Error Proxy '+area, errorData.type+'<br>'+errorData.message);
		}
		
	},
	
	Msg: function(title, msg, fn){
        Ext.MessageBox.show({
			title: title,
			buttons: Ext.Msg.OK,
			icon: Ext.MessageBox.WARNING,
			modal: true,
			msg: msg,
			fn: fn
		});
    }
}