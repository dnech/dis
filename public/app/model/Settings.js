Ext.define('App.model.Settings', {
    extend: 'Ext.data.Model',
    fields: [
		{name: 'guid',   type: 'string'	},
        {name: 'name',   type: 'string'	},
        {name: 'data',   type: 'string'	}
	],
	proxy: {
        type: 'rest',
        url: 'settings',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
    },
	listeners: {
        exception: function(obj, response, operation, eOpts){
            App.Error.Proxy('Meta:Settings', obj, response, operation, eOpts);
        }
    }
});