
/* TABLES */
var TABLES = [
	{
		name: 'roles',
		table: '_roles',
		fields: [
			{name: 'id',    type: 'integer'},
			{name: 'guid',  type: 'string'},
			{name: 'name',  type: 'string'},
		]
	},
	{
		name: 'users',
		table: '_users',
		fields: [
			{name: 'id',   		type: 'integer' },
			{name: 'guid',  	type: 'string' },
			{name: 'name', 		type: 'string' },
			{name: 'login', 	type: 'string' },
			{name: 'role_guid',	type: 'link',  src: 'roles', key: 'guid' },
		]
	},
	{
		name: 'sessions',
		table: '_sessions',
		fields: [
			{name: 'id',   		  	type: 'string'},
			{name: 'guid',  		type: 'string' },
			{name: 'user_guid', 	type: 'link',		src: 'users', key: 'guid' },
			{name: 'sum', 		  	type: 'integer'},
		]
	},
];

function answer(list){
	
}

var api = {
    create: function(params, callback, sessionID, request, response){
		//calcSQL(params.src)
		callback({success: true, data: answer(FIELDS)});
    },
};

module.exports = api;