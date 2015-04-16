// ACL
var db = global.DB;
var Models = require('./models');

var oldSessionsPeriod = 24 * 60 * 60; //seconds

/* Удаление старых сессии */
function clearOldSession(delta, ok, err) {
	/* NEED OPTIMIZED */
	/* 
	var oldTime = new Date();
	oldTime.setTime(oldTime.getTime() - (delta * 1000));
	console.log('!!!!!!! DESTROY OLD Session', oldTime);
	Models.Sessions.destroy({ where: {updatedAt: {$lt: oldTime,}}})
	*/
	Models.Sessions.destroy({ where: '"updatedAt" < NOW() - INTERVAL \'1 hour\''}, { raw: true })	
		.success(function() {ok();}).error(function(error){err('session',error)});
}

/* Поиск пользователя по сессии */
function getUserBySsid(ssid, ok, err) {
	clearOldSession(oldSessionsPeriod, function(){
		Models.Sessions.find({where: {guid: ssid}}).success(function(session) {if (session) {
			session.updateAttributes({}).success(function() {
				Models.Users.find({where: {guid: session.user_guid}}).success(function(user) {if (user) {
					Models.Roles.find({where: {guid: user.role_guid}}).success(function(role) {if (role) {
						ok(session, user, role);
					} else {err('session', 'Role not found');}}).error(function(error){err('session', error)});
				} else {err('session', 'User not found');}}).error(function(error){err('session', error)});
			}).error(function(error){err('session', error)})
		} else {err('session', 'Session not found');}}).error(function(error){err('session', error)});
	}, err);
}

/* Вход по логину и паролю */
function loginByPass(login, pass, ok, err) {
	clearOldSession(oldSessionsPeriod, function(){
		var salt   = global.Salt;
    	var crypto = global.Crypto;
    	pass = crypto.createHash('md5').update(salt+pass+salt).digest('hex');
					
		var options = {where: {login: login, pass:  pass}};
		Models.Users.find(options).success(function(user) { if (user) {
				var session = {
					guid: global.UUID.v4(),
					user_guid: user.guid
				};
				Models.Sessions.build(session).save()
					.success(function() {
						getUserBySsid(session.guid, function(session, user, role){
							ok({name:user.name, login:user.login, ssid: session.guid, role: role.name, config: user.config, extend: role.extend});
						}, err);
					}).error(function(error){err('session', error)});
		} else {err('session', 'Bad login or password');}}).error(function(error){err('session', error)});
	}, err);
}

/* Вход по сессии */
function loginBySsid(ssid, ok, err) {
	clearOldSession(oldSessionsPeriod, function(){
		getUserBySsid(ssid, function(session, user, role){
			ok({name:user.name, login:user.login, ssid: session.guid, role: role.name, config: user.config, extend: role.extend});
		}, err);
	}, err);
}

/* Завершение сессии*/
function logout(ssid, ok, err) {
	clearOldSession(oldSessionsPeriod, function(){
		Models.Sessions.destroy({ where: {guid: ssid}})
			.success(function() {ok({ssid: ssid});}).error(function(error){err('session', error)});
	}, err);
}

/* Получение имен колонок связанных с ACTION */
function getActionColumn(action) {
	switch (action) {
		case 'USE': 	return 'action_use'   ;
		case 'LIST': 	return 'action_list'  ;
		case 'CREATE':	return 'action_create';
		case 'READ':	return 'action_read'  ;
		case 'UPDATE':	return 'action_update';
		case 'DELETE':	return 'action_delete';
	}
}

/* Проверка прав доступа к константам */
function checkConstants(ssid, constant, action, allow, err) {
	getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.constants[action]){ 
			allow(true); // Allow by role
		} else {
			Models.AclConstants.find({ where: {role_guid: curRole.guid, constant_guid: constant.guid}}).success(function(curACL) {if (curACL) {
				allow(curACL[getActionColumn(action)]);	
			} else {allow(false)}}).error(function(error){err('permission', error)}); // Find AclModules
		}
	}, err); // Find User
}

/* Проверка прав доступа к модулям */
function checkModules(ssid, module, action, allow, err) {
	getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.modules[action]){ 
			allow(true); // Allow by role
		} else {
			Models.AclModules.find({ where: {role_guid: curRole.guid, module_guid: module.guid}}).success(function(curACL) {if (curACL) {
				allow(curACL[getActionColumn(action)]);	
			} else {allow(false)}}).error(function(error){err('permission', error)}); // Find AclModules
		}
	}, err); // Find User
}

/* Проверка прав доступа к таблицам */
function checkTables(ssid, table, action, allow, err) {
	getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.tables[action]){ 
			allow(true); // Allow by role
		} else {
			Models.AclTables.find({ where: {role_guid: curRole.guid, table_guid: table.guid}}).success(function(curACL) {if (curACL) {
				allow(curACL[getActionColumn(action)]);	
			} else {allow(false)}}).error(function(error){err('permission', error)}); // Find AclTables
		}
	}, err); // Find User
}

/* Проверка прав доступа к окнам */
function checkWindows(ssid, window, action, allow, err) {
	getUserBySsid(ssid, function(curSession, curUser, curRole){
		var extend = JSON.parse(curRole.config);
		if (extend.windows[action]){ 
			allow(true); // Allow by role
		} else {
			Models.AclWindows.find({ where: {role_guid: curRole.guid, window_guid: window.guid}}).success(function(curACL) {if (curACL) {
				allow(curACL[getActionColumn(action)]);	
			} else {allow(false)}}).error(function(error){err('permission', error)}); // Find AclWindows
		}
	}, err); // Find User
}

module.exports = {
	loginByPass: loginByPass,
	loginBySsid: loginBySsid,
	logout: 	 logout,
	
	getActionColumn: getActionColumn,
	getUserBySsid:   getUserBySsid,
	
	checkConstants:  checkConstants,
	checkModules:    checkModules,
	checkTables:     checkTables,
	checkWindows:    checkWindows
};
