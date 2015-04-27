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
					+property+' LIKE \''+value+'%\' OR '
					+property+' LIKE \'%'+value+'%\' OR '
					+property+' LIKE \'%'+value+'\' OR '
					+property+' = \''+value+'\' '
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
			var fn = new Buffer(curTable.config, 'base64').toString('utf8'),
				table = (new Function(fn))();
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
							var property = table.sql.filters[item.property] || quoteField(item.property);
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
							var direction = (quoteString(item.direction)!=='ASC')?'DESC':'ASC';
							options.sort += ' '+quoteField(item.property)+' '+direction+', ';
						});
					}
				} catch(err){
					sendError('db', 'Error sort data '+err.message, res);
				}
				
				// EXTRA
				options.ExtraParams = table.sql.params || {};
				try {
					if (typeof(params.ExtraParams)==='string'){
						var params = JSON.parse('{"data":'+params.ExtraParams+'}');
						for(var key in params.data) {
						  options.ExtraParams[key] = params.data[key];
						}
					}
				} catch(err){
					sendError('db', 'Error sort data '+err.message, res);
				}
				

					var sql		= table.sql.query;
					sql 		= sql.replace('%FILTER%',			options.filter);
					sql 		= sql.replace('%SORT%',				options.sort);
					sql 		= sql.replace('%LIMIT%',			options.limit);
					
					var countsql = table.sql.query;
					countsql = countsql.replace('%FILTER%',			options.filter);
					countsql = countsql.replace('%SORT%',	'');
					countsql = countsql.replace('%LIMIT%',	'');
					countsql = 'SELECT COUNT(*) ' + countsql.substr(countsql.indexOf('FROM'));
					countsql = countsql.substr(0, countsql.indexOf('ORDER'));
					
					for(var key in options.ExtraParams) {
						var value = options.ExtraParams[key];
						if (typeof(value) === 'function') {
							value = value(options.ExtraParams, this);
						}
						sql      =      sql.replace('%PARAMS_'+key+'%',	value);
						countsql = countsql.replace('%PARAMS_'+key+'%',	value);
					}
						
					sql = sql.replace('%SESSION_GUID%',		curSession.dataValues.guid);
					sql = sql.replace('%USER_GUID%',  		curUser.dataValues.guid);
					sql = sql.replace('%USER_NAME%',		curUser.dataValues.name);
					sql = sql.replace('%USER_LOGIN%',		curUser.dataValues.login);
					sql = sql.replace('%ROLE_GUID%',		curRole.dataValues.guid);
					sql = sql.replace('%ROLE_NAME%',		curRole.dataValues.name);
					
					countsql = countsql.replace('%SESSION_GUID%',		curSession.dataValues.guid);
					countsql = countsql.replace('%USER_GUID%',  		curUser.dataValues.guid);
					countsql = countsql.replace('%USER_NAME%',		curUser.dataValues.name);
					countsql = countsql.replace('%USER_LOGIN%',		curUser.dataValues.login);
					countsql = countsql.replace('%ROLE_GUID%',		curRole.dataValues.guid);
					countsql = countsql.replace('%ROLE_NAME%',		curRole.dataValues.name);
					
					
					
					//console.log('====================================');
					//console.log('table.sql', table.sql);
					//console.log('++++++++++++++++++++++++++++++++++++');
					//console.log('sql', sql);
					//console.log('countsql', countsql);
					
					//console.log('countsql', countsql);
					
					global.DB.query(countsql/*, { type: global.DB.QueryTypes.SELECT}*/)
						.then(function(counts, meta) {
							console.log('count', counts, counts[0].count, meta);
							//res.send({success: true, total: parseInt(countresult[0].count),  data: results});
							global.DB.query(sql, { type: global.DB.QueryTypes.SELECT})
								.then(function(results) {
									console.log('results1', results.length);
									if (typeof(table.sql.recordsmodfn) === 'function') {
										results = table.sql.recordsmodfn(results);
									}
									console.log('results2', results.length);
									res.send({success: true, total: parseInt(counts[0].count),  data: results});
								})
							.error(function(err){sendError('db', err, res)});
						})
					.error(function(err){sendError('db', err, res)});
			
			}
			//.then(function(answer) {
			//	  res.send({success: true, total: counter.count,  data: answer});
			//	})
			//}
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
			Models.Model(curTable, function(model){
				/* UPDATE BEGIN */
				var params = req.body;
				delete params.id;
				params.updatedBy = user.guid;
				model.find(req.params.id).then(function(user) {
					user.updateAttributes(params).then(function() {
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
	
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow, session, user, role){if (allow){
			Models.Model(curTable, function(model){
				/* DELETE BEGIN */
				var id = req.params.id;
				model.find(req.params.id).then(function(record) {
					if (record) {
						record.destroy().then(function() {
							res.send({success: true});
						}).error(function(err){sendError('db', err, res)})
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