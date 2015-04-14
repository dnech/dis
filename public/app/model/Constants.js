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
    }
});