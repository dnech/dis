Ext.define('App.model.Windows', {
    extend: 'Ext.data.Model',
    fields: [
		{name: 'guid',   type: 'string'	},
        {name: 'name',   type: 'string'	},
        {name: 'title',  type: 'string'	},
        {name: 'data',   type: 'string'	}
	],
	proxy: {
        type: 'rest',
        url: 'windows',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
    },
	listeners: {
        exception: function(obj, response, operation, eOpts){
            App.Error.Proxy('Meta:Windows', obj, response, operation, eOpts);
        }
    }
});