var express		= require('express'),
	http		= require('http'),
	path		= require('path'),
	uuid		= require('node-uuid'),
	crypto		= require('crypto'),
	Sequelize	= require('sequelize'),
	nconf		= require('nconf'),
    extdirect	= require('extdirect'),
	router		= require('./app/router');

nconf.env().file({ file: './app/config.json'});

db = new Sequelize(nconf.get("DB_NAME"), nconf.get("DB_USER"), nconf.get("DB_PASS"), {
      dialect: nconf.get("DB_DIALECT"),   // or 'sqlite', 'mysql', 'mariadb'
      port:    nconf.get("DB_PORT"),      // or 3306 (5432 for postgres)
	  logging: function(log){
        //console.log(log);
      }
  });

db
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  });
  
// Init
global.ROOT 	 = __dirname;
global.PUBLIC	 = path.join(__dirname, 'public');
global.RESOURCES = path.join(__dirname, 'resources');
global.Sequelize = Sequelize;
global.DB		 = db;
global.UUID		 = uuid;
global.Crypto	 = crypto;
global.Salt		 = nconf.get("SERVER_SALT");

var app = express();

// all environments
app.set('port', process.env.PORT || nconf.get("SERVER_PORT"));
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
// handle the request for the api from the client

/*          EXT DIRECT        */
/* http://bannockburn.io/2013/06/ext-direct-with-sencha-touch-2-nodejs-expressjs/ */
var EXTDIRECT_PATH = nconf.get("EXTDIRECT_PATH"),
    EXTDIRECT_NAMESPACE = nconf.get("EXTDIRECT_NAMESPACE"),
    EXTDIRECT_API_NAME = nconf.get("EXTDIRECT_API_NAME"),
    EXTDIRECT_PREFIX = nconf.get("EXTDIRECT_PREFIX");
	
app.get('/directapi', function(request, response) {
    var api = extdirect.getAPI(EXTDIRECT_NAMESPACE, EXTDIRECT_API_NAME, EXTDIRECT_PATH, EXTDIRECT_PREFIX);
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(api);
});
 
app.get(EXTDIRECT_PATH, function(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify({success:false, msg:'Unsupported method. Use POST instead.'}));
});
 
app.post(EXTDIRECT_PATH, function(request, response) {
    extdirect.processRoute(request, response, EXTDIRECT_PATH);
});

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(global.PUBLIC));

//router
router.init(app);

app.listen(nconf.get("SERVER_PORT"));
console.log('Listening on port '+nconf.get("SERVER_PORT"));