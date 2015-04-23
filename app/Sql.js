
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
/*
var TABLELIST = [];
var FIELDLIST = [];

function getTable(name){
	for (var i = 0; i < TABLES.length; i++) {
  		if (TABLES[i].name === name){
  			return TABLES[i];
  		}
	}
}

function getField(table, name){
	for (var i = 0; i < table.fields.length; i++) {
  		if (table.fields[i].name === name){
  			return table.fields[i];
  		}
	}
}

function getPath(path){
	for (var i = 0; i < TABLELIST.length; i++) {
  		if (TABLELIST[i].path === path){
  			return TABLELIST[i];
  		}
	}
}

function addPath(path, table, field){
	if (!getPath(path)) {
		TABLELIST.push({
			parent: 't'+TABLELIST.length,
			alias: 	't'+(TABLELIST.length+1),
			path: 	path,
			table: 	table.table,
			src:	field.src,
			key1:   field.name,
			key2:   field.key,
		});
	}
}
*/
/*
function calcField(base, field, alias){
	
	console.log('===============================================');
	console.log('base', base);
	console.log('field', field);
	
	var FIELDS = field.split('.');
	console.log('FIELDS', FIELDS);
	
	var tablepath = base.name;
	var curTable = base;
	if (curTable) {
		for (var i = 0; i < FIELDS.length-1; i++) {
			var curField = getField(curTable, FIELDS[i]);
			if (curField){
				if (curField.type === 'link') {
					curTable = getTable(curField.src);
					if (curTable) {
						tablepath += '.'+curField.name;
						addPath(tablepath, curTable, curField);
						console.log(tablepath);	
					} else {console.log('ERROR: table "'+curField.src+'" not found');}
				} else {console.log('ERROR: field "'+curField.name+'" in table "'+curTable.table+'" not link');}
			} else {console.log('ERROR: field "'+FIELDS[i]+'" in table "'+curTable.name+'" not found');}
		}	
	} else {console.log('ERROR: table "'+BASE+'" not found');}
	
	var curField = getField(curTable,FIELDS[FIELDS.length-1]);
	if (curField || FIELDS[FIELDS.length-1]=='*') {
		//debugger;
		FIELDLIST.push({
			alias: alias,
			path:  tablepath,
			field: curField ? curField.name : '*'
		});
	} else {console.log('ERROR: field "'+FIELDS[FIELDS.length-1]+'" in table "'+curTable.name+'" not found');}
	
	
}
*/


/**
 *
 *
 *      S Q L     B I L D E R 
 *
 *
*/ 
var sql = function(scheme, base){
	me = this;
	me.scheme = scheme;
	me.base	  = base;
	
	me.clear = function(){
		me.calcTables = [];
		me.calcFields = [];
	
		me.arSELECT = [];
		me.arFROM   = [];
		me.arJOIN   = [];
		me.arWHERE  = [];
		me.arLIMIT  = [];
		
		me.Errors  = [];
	};
	me.clear();
	
	/*
	
		// scheme
		[{
			name: 'roles',
			table: '_roles',
			fields: [
				{name: 'id',    type: 'integer'},
				{name: 'guid',  type: 'string'},
				{name: 'name',  type: 'string'},
			]
		},{
			name: 'users',
			table: '_users',
			fields: [
				{name: 'id',   		type: 'integer' },
				{name: 'guid',  	type: 'string' },
				{name: 'name', 		type: 'string' },
				{name: 'login', 	type: 'string' },
				{name: 'role_guid',	type: 'link',  src: 'roles', key: 'guid' },
			]
		},{
			name: 'sessions',
			table: '_sessions',
			fields: [
				{name: 'id',   		  	type: 'string'},
				{name: 'guid',  		type: 'string' },
				{name: 'user_guid', 	type: 'link',		src: 'users', key: 'guid' },
				{name: 'sum', 		  	type: 'integer'},
			]
		}]
	
		// exemple constructor
		sql(scheme, 'sessions')
			.select(fields)
		//	.from('opf', 'opf')
			.join('user', 'user.id = opf.user_id', 'user')
			.join('user', 'user.id = opf.user_id', 'user')
			.where()
			
	*/
	
	
	// Get table settings by table name
	me.getSchemeTable = function(name){
		for (var i = 0; i < me.scheme.length; i++) {
			if (me.scheme[i].name === name){
				return me.scheme[i];
			}
		}
	};
	
	// Get field settings by table settings and field name
	me.getSchemeField = function(table, name){
		for (var i = 0; i < table.fields.length; i++) {
			if (table.fields[i].name === name){
				return table.fields[i];
			}
		}
	};
	
		
	// Get table settings by table name
	// {table:table, as:as}
	me.getFrom = function(name){
		for (var i = 0; i < me.arFROM.length; i++) {
			if (me.arFROM[i].table === name){
				return me.arFROM[i];
			}
		}
	};
	
	// Get field settings by table settings and field name
	// {src: 'user_guid.name', as: 'UserName'}
	me.getSelect = function(table, name){
		for (var i = 0; i < me.arSELECT.length; i++) {
			if (me.arSELECT[i].name === name){
				return me.arSELECT[i];
			}
		}
	};
	
	/* CONSTRUCTOR */

	me.select = function(fields){
		me.arSELECT = me.arSELECT.concat(fields);
		//[
		//	{src: 'user_guid.name', as: 'UserName'}
		//]
		return me;
	};
	
	me.from = function(table, as){
		//as = as || table;
		me.arFROM.push({table:table, as:as});
		//[
		//	{table:table, as:as}
		//]
		return me;
	};
	
	me.join = function(table, on, as){
		//as = as || table;
		me.arJOIN.push({table:table, on:on, as:as});
		//[
		//	{table:table, as:as, on: on}
		//]
		return me;
	};
	
	
	
	
	

	//me.calcTables = [];
	//me.calcFields = [];

	me.getCalcTable = function(path){
		var list = me.calcTables;
		for (var i = 0; i < list.length; i++) {
			if (list[i].path === path){
				return list[i];
			}
		}
	};

	me.addCalcTable = function(path, table, field){
		var list = me.calcTables;
		if (!me.getCalcTable(path)) {
			me.calcTables.push({
				path:		path,
				table:		table,
				field:		field
				parent: 	't'+list.length,
				parentkey:	field.key,
				alias:		't'+(list.length+1),
				aliaskey:   field.name,	
			});
		}
	};

	me.addCalcField = function(field, as){
		var base = getSchemeTable(me.base);
		if (base) {
			var paths = field.split('.');
			
			var tablepath = base.name;
			var curTable  = base;
			if (curTable) {
				for (var i = 0; i < paths.length-1; i++) {
					var curField = me.getSchemeField(curTable, paths[i]);
					if (curField){
						if (curField.type === 'link') {
							curTable = me.getSchemeTable(curField.src);
							if (curTable) {
								tablepath += '.'+curField.name;
								me.addCalcTable(tablepath, curTable, curField);	
							} else {throw new Error('Field builder ['+field+']: table "'+curField.src+'" not found');}
						} else {throw new Error('Field builder ['+field+']: field "'+curField.name+'" in table "'+curTable.table+'" not link');}
					} else {throw new Error('Field builder ['+field+']: field "'+paths[i]+'" in table "'+curTable.name+'" not found');}
				}	
			} else {throw new Error('Field builder ['+field+']: table "'+base.name+'" not found');}
			
			var curField = me.getSchemeField(curTable,paths[paths.length-1]);
			if (curField || paths[paths.length-1]=='*') {
				me.calcFields.push({
					path:  tablepath,
					field: curField ? curField.name : '*',
					as:    as,
				});
			} else {throw new Error('Field builder ['+field+']: field "'+paths[paths.length-1]+'" in table "'+curTable.name+'" not found');}
		} else {throw new Error('Field builder: base table "'+me.base+'" not found');}
	};
	
	
	
	
	
	
	me.strField = function(table, name, aleas, connect){
		var res = '"'+table+'"."'+name+'"';
		if (aleas !== '') { res += ' AS "'+aleas+'"';}
		if (name == '*') { res = '"'+table+'".*';}
		res += connect ? ', \n' : ' \n';
		return res; 	
	};
	
	
	
	me.addTable = function(cfg){
		me.preTableList.push(cfg);
	};
	
	me.Select = function(){
		try{		
			me.clear();
				
			me.base = me.getTableSettings(src.base);
			me.addTable({
				path:   me.base.name,
				table:  me.base.table,
				parent: 	'',
				parentkey:  '',
				alias:  	't1',
				aliaskey:   '',
			});
			
			var fields = me.src.fields;
			for (var i = 0; i < fields.length; i++) {
				me.calcField(fields[i].src, fields[i].as);
			}
			
			me.sSELECT = 'SELECT \n';
			
			var fields = me.preFieldList;
			for (var i = 0; i < fields.length; i++) {
				me.sSELECT += 	me.strField(
					getPath(fields[i].path).alias,
					fields[i].field,
					fields[i].alias,
					(i<(fields.length-1))
				);
			}
		} catch(err) {
			me.Errors.push('SELECT: '+err.message);
		}		
		return me;
	};
	
	me.From = function(table, as){
		me.sFROM = ' FROM "'+table+'" AS "'+as+'" \n';
		return me;
	}
	me.Join = function(table, as, on){
		me.sJOIN += ' LEFT JOIN "'+table+'" AS "'+as+'" ON ('+on+') \n';
		return me;
	}
	
	me.toQuery = function(){
		try{
			me.sSELECT 
			
			me.sFROM = ' FROM "'+me.preTableList[0].table+'" AS "'+me.preTableList[0].alias+'" \n';
			me.sJOIN = '';
			var tables = me.preTableList;
			for (var i = 1; i < tables.length; i++) {
				me.Join(tables[i].table, tables[i].alias, '"'+tables[i].alias+'"."'+tables[i].aliaskey+'" = "'+tables[i].parent+'"."'+tables[i].parentkey+'"');
			}
			
			SQL += FROM;
			SQL += JOIN;
			
			return {success: true, data: SQL};
		} catch(err){
			return {success: false, error: err.message};
		}
		
	};
	
	me.toQuery = function(){
		try{
			me.clear();
			
			me.base = me.getTableSettings(src.base);
			me.addTable({
				path:   me.base.name,
				table:  me.base.table,
				parent: 	'',
				parentkey:  '',
				alias:  	't1',
				aliaskey:   '',
			});
			
			var fields = me.src.fields;
			for (var i = 0; i < fields.length; i++) {
				me.calcField(fields[i].src, fields[i].as);
			}
			
			var SQL = '--- SELECT \n';
			
			var fields = me.preFieldList;
			for (var i = 0; i < fields.length; i++) {
				SQL += 	me.strField(
					getPath(fields[i].path).alias,
					fields[i].field,
					fields[i].alias,
					(i<(fields.length-1))
				);
			}
			
			var FROM = ' FROM "'+me.preTableList[0].table+'" AS "'+me.preTableList[0].alias+'" \n';
			
			var JOIN = '';
			var tables = me.preTableList;
			for (var i = 1; i < tables.length; i++) {
				JOIN += 	' LEFT JOIN "'+tables[i].table+'" AS "'
						+tables[i].alias+'" ON ('
						+'"'+tables[i].alias+'"."'+tables[i].aliaskey+'" = '
						+'"'+tables[i].parent+'"."'+tables[i].parentkey+'") \n';
			}
			
			SQL += FROM;
			SQL += JOIN;
			
			return {success: true, data: SQL};
		} catch(err){
			return {success: false, error: err.message};
		}
		
	};

	return me;
}

function calcSQL(src){
	var sql = builder(TABLES, src);
	return sql.toQuery();
}
var api = {
    create: function(params, callback, sessionID, request, response){
		callback(calcSQL(params.src));
    },
};

module.exports = api;