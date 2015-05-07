// DB
var ACL = require('../acl');
var Models = require('../models');

/* Формирование положительного ответа */
function sendOk(data, res){
	res.send({success: true, data: data});
}

/* Формирование ответа об ошибке */
function sendError(type, error, res){
	if (typeof(error)==='object'){
		res.send({success: false, type: type, message: [error.message]});
	} else {
		res.send({success: false, type: type, message:[error]});
	}
}

/* Получить таблицу */
function getTable(name, ok, err){
	Models.sysTables.find({ where: {name: name}}).then(function(curTable) {if (curTable) {
		ok(curTable);
	} else {err('db', 'Table "'+name+'" not found.')}
	}).error(function(error){err('db', error)});
}


//-------------------------------------------------------------------------
// ACL
exports.acl = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = req.params.action;
	
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow){
			res.send({success: true, allow: allow,  data: 'Permission '+(allow?'allow':'deny')+', table: "'+table+'", action: "'+action+'"'});
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});
};

function quoteString(val){
  return null == val ? '' : String(val);
}

function quoteField(field) {
  field = field.replace(/"/g, '""');
  return '"' + field + '"';
}

function getFilter(operator, property, value) {
	if (typeof value === 'number') {
		if (operator === 'lt') {
			return ' '+property+' < '+value+' AND ';
		}
		if (operator === 'gt') {
			return ' '+property+' > '+value+' AND ';
		}
		if (operator === 'eq') {
			return ' '+property+' = '+value+' AND ';
		}
	}
	
	if (typeof value === 'string') {
		value = quoteString(value);
		if (operator === 'like') {
			return ' ( '
					//+property+' ILIKE \''+value+'%\' OR '
					+property+' ILIKE \'%'+value+'%\' ' //OR '
					//+property+' ILIKE \'%'+value+'\' OR '
					//+property+' = \''+value+'\' '
					+') AND ';
		}
		if (operator === 'lt') {
			return ' '+property+' < \''+value+'\' AND ';
		}
		if (operator === 'gt') {
			return ' '+property+' > \''+value+'\' AND ';
		}
		if (operator === 'eq') {
			return ' '+property+' = \''+value+'\' AND ';
		}
	}
	return '';
}

//-------------------------------------------------------------------------
// LIST
exports.list = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'LIST';
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, curSession, curUser, curRole){if (allow){
			curTable.CURRENT = {table:curTable,session:curSession,user:curUser,role:curRole};
			var fn = new Buffer(curTable.config, 'base64').toString('utf8'),
				table = (new Function('CONFIG',fn))(curTable.CURRENT);
			if (table.type === 'model') {	
				Models.Model(curTable, function(model){
					/* LIST BEGIN */
					var params = req.query;
					// Sequelize: limit, offset, order
					// ExtJS: page, start, limit
					// ExtJS: sort:[{"property":"firstName","direction":"ASC"}]
					
					var options = {};
					options.offset =  params.start || 0;
					options.limit  =  params.limit || 50;
					options.order  =  [];
						
					if (typeof(params.sort)==='string'){
						var sort = JSON.parse('{"data":'+params.sort+'}');
						sort.data.forEach(function(item, i, arr){
							options.order.push([item.property, item.direction]);
						});
					}
					
					model.findAndCountAll(options).then(function(counter) {
						res.send({success: true, total: counter.count,  data: counter.rows});
					}).error(function(err){sendError('db', err, res)});
					/* LIST END */
				}, function(type, err){sendError(type, err,res)});
			
			}
			/*    SQL QUERY    */
			if (table.type === 'sql') {	
				var params = req.query;
				var options = {};
				
				// LIMIT
				options.limit = '';
				try {
					var offset =  parseInt(params.start, 10) || 0;
					var limit  =  parseInt(params.limit, 10) || 50;
					options.limit = ' LIMIT '+limit+' OFFSET '+offset+' ';
				} catch(err){
					sendError('db', 'Error limit data '+err.message, res);
				}
				
				// FILTER
				options.filter = '';
				try {
					if (typeof(params.filter)==='string'){
						var filter = JSON.parse('{"data":'+params.filter+'}');
						filter.data.forEach(function(item, i, arr){
							var operator = quoteString(item.operator);
							var property = table.sql.replace_field[item.property] || quoteField(item.property);
							var value    = item.value;
							
							options.filter += getFilter(operator, property, value);
						});
					}
				} catch(err){
					sendError('db', 'Error filter data '+err.message, res);
				}
				
				// SORT
				options.sort = '';
				try {
					if (typeof(params.sort)==='string'){
						var sort = JSON.parse('{"data":'+params.sort+'}');
						sort.data.forEach(function(item, i, arr){
							var field     = table.sql.replace_field[item.property] || quoteField(item.property);
							var direction = (quoteString(item.direction)!=='ASC')?'DESC':'ASC';
							options.sort += ' '+field+' '+direction+', ';
						});
					}
				} catch(err){
					sendError('db', 'Error sort data '+err.message, res);
				}

				// HOOK BEFORE REPLACE
				if (typeof(table.sql.before_replace) === 'function') {
					table.sql.before_replace(options);
				}
				
				// DB SQL
				var sql	= table.sql.query;
				sql 	= sql.replace(new RegExp('%FILTER%','g'),		options.filter);
				sql 	= sql.replace(new RegExp('%SORT%','g'),			options.sort);
				sql 	= sql.replace(new RegExp('%LIMIT%','g'),		options.limit);
				
				sql		= sql.replace(new RegExp('%SESSION_GUID%','g'),	curSession.dataValues.guid);
				sql		= sql.replace(new RegExp('%USER_GUID%','g'),  	curUser.dataValues.guid);
				sql		= sql.replace(new RegExp('%USER_NAME%','g'),	curUser.dataValues.name);
				sql		= sql.replace(new RegExp('%USER_LOGIN%','g'),	curUser.dataValues.login);
				sql		= sql.replace(new RegExp('%ROLE_GUID%','g'),	curRole.dataValues.guid);
				sql		= sql.replace(new RegExp('%ROLE_NAME%','g'),	curRole.dataValues.name);
				
				
				// COUNT SQL
				if (!table.sql.query_count) {
					var countsql = table.sql.query;
					countsql = countsql.replace(new RegExp('%FILTER%','g'),			options.filter);
					countsql = countsql.replace(new RegExp('%SORT%','g'),			options.sort);
					countsql = countsql.replace(new RegExp('%LIMIT%','g'),			'');
					
					countsql = countsql.replace(new RegExp('%SESSION_GUID%','g'),	curSession.dataValues.guid);
					countsql = countsql.replace(new RegExp('%USER_GUID%','g'),  	curUser.dataValues.guid);
					countsql = countsql.replace(new RegExp('%USER_NAME%','g'),		curUser.dataValues.name);
					countsql = countsql.replace(new RegExp('%USER_LOGIN%','g'),		curUser.dataValues.login);
					countsql = countsql.replace(new RegExp('%ROLE_GUID%','g'),		curRole.dataValues.guid);
					countsql = countsql.replace(new RegExp('%ROLE_NAME%','g'),		curRole.dataValues.name);
					
					//countsql = 'SELECT COUNT(*) ' + countsql.substr(countsql.indexOf('FROM'));
					countsql = countsql.substr(0, countsql.indexOf('ORDER'));
				} else {
					countsql = table.sql.query_count;
				}
				
				// EXTRA
				options.ExtraParams = table.sql.default_params || {};
				try {
					if (typeof(params.ExtraParams)==='string'){
						var params = JSON.parse('{"data":'+params.ExtraParams+'}');
						for(var key in params.data) {
						  options.ExtraParams[key] = params.data[key];
						}
					}
				} catch(err){
					sendError('db', 'Error extra data '+err.message, res);
				}
				
				// replace ExtraParams
				for(var key in options.ExtraParams) {
					var value = options.ExtraParams[key];
					if (typeof(value) === 'function') {
						value = value(options.ExtraParams, this);
					}
					sql      =      sql.replace('%PARAMS_'+key+'%',	value);
					countsql = countsql.replace('%PARAMS_'+key+'%',	value);
				}
				
				// HOOK BEFORE QUERY
				if (typeof(table.sql.before_query) === 'function') {
					table.sql.before_query(sql, countsql);
				}	
				
				// RUN QUERY
				if (!table.sql.query_count) {
					global.DB.query(countsql, { type: global.DB.QueryTypes.SELECT})
					.then(function(counts){
						global.DB.query(sql, { type: global.DB.QueryTypes.SELECT})
							.then(function(results){
								// HOOK BEFORE RESULT
								if (typeof(table.sql.before_result) === 'function') {
									results = table.sql.before_result(results);
								}
								res.send({success: true, total: counts.length,  data: results, sql: sql, countsql: countsql});
							})
							.error(function(err){sendError('db', err + ' (sql: "' + sql + '")', res)});
						})
					.error(function(err){sendError('db', err + ' (countsql: "' + sql + '")', res)});
				} else {
					global.DB.query(countsql)
					.then(function(counts, meta){
						global.DB.query(sql, { type: global.DB.QueryTypes.SELECT})
							.then(function(results){
								// HOOK BEFORE RESULT
								if (typeof(table.sql.before_result) === 'function') {
									results = table.sql.before_result(results);
								}
								res.send({success: true, total: parseInt(counts[0].count),  data: results, sql: sql, countsql: countsql});
							})
							.error(function(err){sendError('db', err + ' (sql: "' + sql + '")', res)});
						})
					.error(function(err){sendError('db', err + ' (countsql: "' + sql + '")', res)});
				}	
				
			} // END SQL

		} else {sendError('permission', 'Permission denied, table: "'+table+'", action: "'+action+'"', res);}
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});
};

//-------------------------------------------------------------------------
// CREATE
exports.create = function (req, res) {
    var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'CREATE';
	
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, session, user, role){if (allow){
			curTable.CURRENT = {table:curTable,session:session,user:user,role:role};
			Models.Model(curTable, function(model){
				/* CREATE BEGIN */
				var params = req.body;
				delete params.id;
				params.guid = global.UUID.v4();
				params.createdBy = user.guid;
				params.updatedBy = user.guid;
				model.create(params)
					.then(function(newrecord) {
						sendOk(newrecord.values, res);
					}).error(function(err){sendError('db', err, res)})
				/* CREATE END */
			}, function(type, err){sendError(type, err,res)});
		} else {sendError('permission', 'Permission denied, table: "'+table+'", action: "'+action+'"', res);}
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});	
};

//-------------------------------------------------------------------------
// READ
exports.read = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'READ';
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, session, user, role){if (allow){
			curTable.CURRENT = {table:curTable,session:session,user:user,role:role};
			Models.Model(curTable, function(model){
				/* READ BEGIN */
				var params = req.query;
				model.find(params.id).then(function(record) {
					sendOk(record, res);
				}).error(function(err){sendError('db', err, res)})
				/* READ END */
			}, function(type, err){sendError(type, err,res)});
		} else {sendError('permission', 'Permission denied, table: "'+table+'", action: "'+action+'"', res);}
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});
};
//-------------------------------------------------------------------------
// UPDATE
exports.update = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'UPDATE';
	
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, session, user, role){if (allow){
			curTable.CURRENT = {table:curTable,session:session,user:user,role:role};
			Models.Model(curTable, function(model){
				/* UPDATE BEGIN */
				var params = req.body;
				delete params.id;
				params.updatedBy = user.guid;
				model.find(req.params.id).then(function(record) {
					record.updateAttributes(params).then(function() {
						res.send({success: true});
					}).error(function(err){sendError('db', err, res)})
				}).error(function(err){sendError('db', err, res)})
				/* UPDATE END */
			}, function(type, err){sendError(type, err,res)});
		} else {sendError('permission', 'Permission denied, table: "'+table+'", action: "'+action+'"', res);}
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});
};

//-------------------------------------------------------------------------
// DELETE
exports.delete = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'DELETE';
	
	var params = req.query || {};
	try {
		if (typeof(params.ExtraParams)==='string'){
			params = JSON.parse('{"data":'+params.ExtraParams+'}');
			params = params.data;
		}
	} catch(err){
		//sendError('db', 'Error extra data '+err.message, res);
	}
					
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, session, user, role){if (allow){
			curTable.CURRENT = {table:curTable,session:session,user:user,role:role};
			Models.Model(curTable, function(model){
				/* DELETE BEGIN */
				console.log('---1');
				var id = req.params.id;
				model.find({paranoid: false, where: {id: req.params.id}}).then(function(record) {
					console.log('---2');
					if (record) {
						console.log('---3');
						var force  	 = (params.force) ? true : false;
						var restore  = (params.restore) ? true : false;
						console.log('---4',force, model.CONFIG.model.settings.paranoid);
						if (!force && model.CONFIG.model.settings.paranoid) {
							if (restore){
								console.log('---5');
								record.restore({where: {id: req.params.id}, limit: 1}).then(function() {
									console.log('---6');
									res.send({success: true});
								}).error(function(err){sendError('db', err, res)})
							} else {
								console.log('---7');
								record.updateAttributes({deletedBy: user.guid}).then(function() {
									console.log('---8');
									record.destroy({limit: 1}).then(function() {
										console.log('---9');
										res.send({success: true});
									}).error(function(err){sendError('db', err, res)})
								}).error(function(err){sendError('db', err, res)})
							}
						} else {
							console.log('---10');
							record.destroy({limit: 1, force: force}).then(function() {
								console.log('---11');
								res.send({success: true});
							}).error(function(err){sendError('db', err, res)})
						}
					} else {sendError('db', 'Error find record '+req.params.id, res);}
				}).error(function(err){sendError('db', err, res)})
				/* DELETE END */
			}, function(type, err){sendError(type, err,res)});
		} else {sendError('permission', 'Permission denied, table: "'+table+'", action: "'+action+'"', res);}
		}, function(type, error) {sendError(type, error, res)});
	}, function(type, error) {sendError(type, error, res)});
};

//-------------------------------------------------------------------------
// ERROR
exports.error = function (req, res) {
    sendError('db', 'Unknow error',res);
};