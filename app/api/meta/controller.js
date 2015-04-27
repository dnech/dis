// META
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

/* Получить список разрешенных констант */
function getConstants(ssid, res){
	ACL.getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.constants['USE']){ 
			Models.sysConstants.findAndCountAll().then(function(records) {
				res.send({success: true, total: records.count,  data: records.rows});
			}).error(function(err){sendError('meta', err, res)});
		} else {
			Models.AclConstants.findAndCountAll({ where: {role_guid: curRole.guid}, include: [Models.sysConstants]}).then(function(records) {
				var recs = [];
				for (var i=0; i<records.count; i++) {
					if (records.rows[i][ACL.getActionColumn('USE')]) {
						recs.push(records.rows[i].sysConstant);
					}
				}
				res.send({success: true, total: recs.length,  data: recs});
			}).error(function(error){sendError('meta', error, res)});
		}
	},function (type, error) {sendError(type, error, res)});	
}

/* Получить список разрешенных модулей */
function getModules(ssid, res){
	ACL.getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.modules['USE']){ 
			Models.sysModules.findAndCountAll().then(function(records) {
				res.send({success: true, total: records.count,  data: records.rows});
			}).error(function(err){sendError('meta', err, res)});
		} else {
			Models.AclModules.findAndCountAll({ where: {role_guid: curRole.guid}, include: [Models.sysModules]}).then(function(records) {
				var recs = [];
				for (var i=0; i<records.count; i++) {
					if (records.rows[i][ACL.getActionColumn('USE')]) {
						recs.push(records.rows[i].sysModule);
					}
				}
				res.send({success: true, total: recs.length,  data: recs});
			}).error(function(error){sendError('meta', error, res)});
		}
	},function (type, error) {sendError(type, error, res)});
}

/* Получить список разрешенных таблиц */
function getTables(ssid, res){
	ACL.getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.tables['USE'] || extend.tables['LIST'] || extend.tables['CREATE'] ||
			extend.tables['READ'] || extend.tables['UPDATE'] || extend.tables['DELETE']){ 
			Models.sysTables.findAndCountAll().then(function(records) {
				res.send({success: true, total: records.count,  data: records.rows});
			}).error(function(err){sendError('meta', err, res)});
		} else {
			Models.AclTables.findAndCountAll({ where: {role_guid: curRole.guid}, include: [Models.sysTables]}).then(function(records) {
				var recs = [];
				for (var i=0; i<records.count; i++) {
					var rec = records.rows[i];
					if (rec[ACL.getActionColumn('USE')] || rec[ACL.getActionColumn('LIST')] ||
						rec[ACL.getActionColumn('CREATE')] || rec[ACL.getActionColumn('READ')] ||
						rec[ACL.getActionColumn('UPDATE')] || rec[ACL.getActionColumn('DELETE')]){
						recs.push(rec.sysTable);
					}
				}
				res.send({success: true, total: recs.length,  data: recs});
			}).error(function(error){sendError('meta', error, res)});
		}
	},function (type, error) {sendError(type, error, res)});
}

/* Получить список разрешенных окон */
function getWindows(ssid, res){
	ACL.getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.windows['USE']){ 
			Models.sysWindows.findAndCountAll().then(function(records) {
				res.send({success: true, total: records.count,  data: records.rows});
			}).error(function(err){sendError('meta', err, res)});
		} else {
			Models.AclWindows.findAndCountAll({ where: {role_guid: curRole.guid}, include: [Models.sysWindows]}).then(function(records) {
				var recs = [];
				for (var i=0; i<records.count; i++) {
					if (records.rows[i][ACL.getActionColumn('USE')]) {
						recs.push(records.rows[i].sysWindow);
					}
				}
				res.send({success: true, total: recs.length,  data: recs});
			}).error(function(error){sendError('meta', error, res)});
		}
	},function (type, error) {sendError(type, error, res)});
}

//-------------------------------------------------------------------------
// LIST META
exports.list = function (req, res) {
	var ssid  = req.params.ssid;
	var type  = req.params.type;
	
	switch (type) {
		case 'constants':
			getConstants(ssid, res)
			break;
		case 'modules':
			getModules(ssid, res)
			break;
		case 'tables':
			getTables(ssid, res)
			break;
		case 'windows':
			getWindows(ssid, res)
			break;
		default:
			sendError('meta', 'Unknow meta', res)
			break;
	}
};

//-------------------------------------------------------------------------
// ERROR
exports.error = function (req, res) {
    sendError('db', 'Unknow error',res);
};