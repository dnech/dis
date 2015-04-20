Ext.ns('App.common.Errors');
App.Error = 
{
	Proxy: function(area, obj, response, operation, eOpts ){
		var errorData = Ext.JSON.decode(response.responseText);
		//console.error('Error Proxy '+area, errorData, operation);
		Ext.Msg.alert('Error Proxy '+area, errorData.type+'<br>'+errorData.message, function(){
			if (errorData.type === 'session') {App.Auth.LogOut();}
		});
	},
	
	Msg: function(title, msg, fn){
        Ext.Msg.alert({
            title: title,
            msg: msg,
            icon: Ext.MessageBox.WARNING,
            buttons: Ext.Msg.OK,
            modal: true,
            fn: fn
        });
    }
}