Ext.define('App.model.Constants', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'guid',   type: 'string'	},
        {name: 'name',   type: 'string'	},
        {name: 'data',   type: 'string'	}
    ],
	proxy: {
        type: 'rest',
        url: 'constants',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
    },
	listeners: {
        exception: function(obj, response, operation, eOpts){
            App.Error.Proxy('Meta:Constants', obj, response, operation, eOpts);
        }
    }
});