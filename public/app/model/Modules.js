Ext.define('App.model.Modules', {
    extend: 'Ext.data.Model',
    fields: [
		{name: 'guid',   type: 'string'	},
        {name: 'name',   type: 'string'	},
        {name: 'data',   type: 'string'	}
	],
	proxy: {
        type: 'rest',
        url: 'modules',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
    },
	listeners: {
        exception: function(obj, response, operation, eOpts){
            App.Error.Proxy('Meta:Modules', obj, response, operation, eOpts);
        }
    }
});