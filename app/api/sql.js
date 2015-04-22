// SQL
var db = global.DB;
var Models = require('./models');



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
