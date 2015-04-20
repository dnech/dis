// Модели
var db = global.DB,
	Sequelize = global.Sequelize;
	
/* -------------------------------------------------------------- */
// Сессии
var Sessions = db.define('Sessions', {
	guid:  	   'STRING',
	user_guid: 'STRING'
}, {
	tableName:  '_sessions',
	timestamps: true,
});

/* -------------------------------------------------------------- */
// Пользователи
var Users = db.define('Users', {
	guid:  		'STRING',
	role_guid:  'STRING',
	name:  		'STRING',
	login: 		'STRING',
	pass:  		'STRING',
	config: 	'TEXT',
	ro:  		'BOOLEAN'
}, {
	tableName:  '_users',
	timestamps: true
});

// Роли
var Roles = db.define('Roles', {
	guid:  	'STRING',
	name:   'STRING',
	config: 'TEXT',
	ro:  	'BOOLEAN'
}, {
	tableName:  '_roles',
	timestamps: true,
});

// Константы
var sysConstants = db.define('sysConstants', {
	guid:	{
      type: 'STRING',
      primaryKey: true
    },
	name:	'STRING',
	data:	'TEXT'
}, {
	tableName:  '_constants',
	timestamps: true
});

// ACL constants
var AclConstants = db.define('AclConstants', {
	role_guid:   	'STRING',
	constant_guid:	'STRING',
	action_use:		'BOOLEAN',
	extend:			'TEXT',
}, {
	tableName:  '_acl_constants',
	timestamps: true
});

AclConstants.belongsTo(sysConstants, {foreignKey: 'constant_guid'});

// Модули
var sysModules = db.define('sysModules', {
	guid:	{
      type: 'STRING',
      primaryKey: true
    },
	name:	'STRING',
	data:	'TEXT'
}, {
	tableName:  '_modules',
	timestamps: true
});

// ACL modules
var AclModules = db.define('AclModules', {
	role_guid:   'STRING',
	module_guid: 'STRING',
	action_use:  'BOOLEAN',
	extend:      'TEXT',
}, {
	tableName:  '_acl_modules',
	timestamps: true
});

AclModules.belongsTo(sysModules, {foreignKey: 'module_guid'});

// Таблицы
var sysTables = db.define('sysTables', {
	guid:	{
      type: 'STRING',
      primaryKey: true
    },
	name:	'STRING',
	title:	'STRING',
	config:	'TEXT',
	data:	'TEXT'
}, {
	tableName:  '_tables',
	timestamps: true
});

// ACL tables
var AclTables = db.define('AclTables', {
	role_guid:   'STRING',
	table_guid:  'STRING',
	action_list:   'BOOLEAN',
	action_create: 'BOOLEAN',
	action_read:   'BOOLEAN',
	action_update: 'BOOLEAN',
	action_delete: 'BOOLEAN',
	extend:    	   'TEXT',
}, {
	tableName:  '_acl_tables',
	timestamps: true
});

AclTables.belongsTo(sysTables, {foreignKey: 'table_guid'});

// Windows
var sysWindows = db.define('sysWindows', {
	guid:	{
      type: 'STRING',
      primaryKey: true
    },
	name:	'STRING',
	title:	'STRING',
	data:	'TEXT'
}, {
	tableName:  '_windows',
	timestamps: true
});

// ACL windows
var AclWindows = db.define('AclWindows', {
	role_guid:   'STRING',
	window_guid: 'STRING',
	action_use: 'BOOLEAN',
	extend:     'TEXT',
}, {
	tableName:  '_acl_windows',
	timestamps: true
});

AclWindows.belongsTo(sysWindows, {foreignKey: 'window_guid'});


// Пользовательские параметры
var sysSettings = db.define('sysSettings', {
	guid:	{
      type: 'STRING',
      primaryKey: true
    },
	user_guid: 'STRING',
	name:	'STRING',
	data:	'TEXT'
}, {
	tableName:  '_settings',
	timestamps: true
});

module.exports = {
	
	Sessions: Sessions,
	Users: Users,
	Roles: Roles,
	
	AclConstants:	AclConstants,
	AclModules: 	AclModules,
	AclWindows:		AclWindows,
	AclTables:		AclTables,
	
	sysConstants:	sysConstants,
	sysModules:		sysModules,
	sysTables:		sysTables,
	sysWindows:		sysWindows,
	sysSettings:	sysSettings,
	
	// Получаем универсальную модель	
	Model: function (table, ok, err) {
		// Получаем настройки таблицы
		try {
			var fn = new Buffer(table.config, 'base64').toString('utf8'),
				obj = (new Function(fn))(),
				model = obj.model;
			var Model = db.define('Model', model.columns, model.settings);
			Model.CONFIG = obj;
			ok(Model);
		} catch (error){
			err('db models', error)
		}
	},
}
