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
	Models.sysTables.find({ where: {name: name}}).success(function(curTable) {if (curTable) {
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

//-------------------------------------------------------------------------
// LIST
exports.list = function (req, res) {
	var ssid   = req.params.ssid;
	var table  = req.params.table;
	var action = 'LIST';
	getTable(table, function (curTable){
		ACL.checkTables(ssid, curTable, action, function(allow){if (allow){
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
					
					model.findAndCountAll(options).success(function(counter) {
						res.send({success: true, total: counter.count,  data: counter.rows});
					}).error(function(err){sendError('db', err, res)});
					/* LIST END */
				}, function(type, err){sendError(type, err,res)});
			
			}
			if (table.type === 'sql') {	
				var params = req.query;
				var options = {};
				options.offset =  params.start || 0;
				options.limit  =  params.limit || 50;
				
				console.log('table.sql.options', table.sql.options);				
				global.DB.query(table.sql.query/*, table.sql.options*/)
					.then(function(results) {
						res.send({success: true, total: results.length,  data: results});
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
		ACL.checkTables(ssid, curTable, action, function(allow){if (allow){
			Models.Model(curTable, function(model){
				/* CREATE BEGIN */
				var params = req.body;
				delete params.id;
				params.guid = global.UUID.v4();
				
				model.create(params)
					.success(function(newrecord) {
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
		ACL.checkTables(ssid, curTable, action, function(allow){if (allow){
			Models.Model(curTable, function(model){
				/* READ BEGIN */
				var params = req.query;
				model.find(params.id).success(function(record) {
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
		ACL.checkTables(ssid, curTable, action, function(allow){if (allow){
			Models.Model(curTable, function(model){
				/* UPDATE BEGIN */
				var params = req.body;
				delete params.id;
				model.find(req.params.id).success(function(user) {
					user.updateAttributes(params).success(function() {
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
		ACL.checkTables(ssid, curTable, action, function(allow){if (allow){
			Models.Model(curTable, function(model){
				/* DELETE BEGIN */
				var id = req.params.id;
				model.find(req.params.id).success(function(user) {
					user.destroy().success(function() {
						res.send({success: true});
					}).error(function(err){sendError('db', err, res)})
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