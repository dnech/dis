var express		= require('express'),
	http		= require('http'),
	path		= require('path'),
	uuid		= require('node-uuid'),
	crypto		= require('crypto'),
	Sequelize	= require('sequelize'),
	nconf		= require('nconf'),
    direct		= require('extdirect'),
	router		= require('./app/router');

nconf.env().file({ file: './app/config.json'});

var DbConfig 		= nconf.get("db"),
	ServerConfig 	= nconf.get("server"),
    directConfig	= nconf.get("direct");
	
db = new Sequelize(DbConfig.base, DbConfig.user, DbConfig.pass, {
      dialect: DbConfig.dialect,   // or 'sqlite', 'mysql', 'mariadb'
      port:    DbConfig.port,      // or 3306 (5432 for postgres)
	  
	  timezone: DbConfig.timezone,
	  
	  pool: {
		max: 5,
		min: 0,
		idle: 10000
	  },
  
	  logging: function(log){
        //console.log(log);
      }
  });

//db
//  .authenticate()
//  .complete(function(err) {
//    if (!!err) {
//      console.log('Unable to connect to the database:', err)
//    } else {
//      console.log('Connection has been established successfully.')
//    }
//  });
 
/*  */ 
// Init
global.ROOT 	 = __dirname;
global.PUBLIC	 = path.join(__dirname, ServerConfig.public);
global.RESOURCES = path.join(__dirname, ServerConfig.resources);
global.Sequelize = Sequelize;
global.DB		 = db;
global.UUID		 = uuid;
global.Crypto	 = crypto;
global.Salt		 = ServerConfig.salt;


	
var app = express();

// all environments
app.set('port', process.env.PORT || ServerConfig.port);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.logger(ServerConfig.logger));
//app.use(express.favicon());
if(ServerConfig.compress){
    app.use(express.compress()); //Performance - we tell express to use Gzip compression
}

//CORS (CROSS DOMAIN QUERY) Supports
if(ServerConfig.cors){
    app.use( function(req, res, next) {
        var ac = ServerConfig.AccessControl;
        res.header('Access-Control-Allow-Origin', ac.AllowOrigin); // allowed hosts
        res.header('Access-Control-Allow-Methods', ac.AllowMethods); // what methods should be allowed
        res.header('Access-Control-Allow-Headers', ac.AllowHeaders); //specify headers
        res.header('Access-Control-Allow-Credentials', ac.AllowCredentials); //include cookies as part of the request if set to true
        res.header('Access-Control-Max-Age', ac.MaxAge); //prevents from requesting OPTIONS with every server-side call (value in seconds)

        if (req.method === 'OPTIONS') {
            res.send(204);
        }
        else {
            next();
        }
    });
}



//          EXT DIRECT        
//Warm up Direct
var directApi = direct.initApi(directConfig);
var directRouter = direct.initRouter(directConfig);

//Routes
//GET method returns API
app.get(directConfig.apiUrl, function(req, res) {
    try{
        directApi.getAPI(
            function(api){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(api);
            }
        );
    }catch(e){
        console.log(e);
    }
});

// Ignoring any GET requests on class path
app.get(directConfig.classUrl, function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({success:false, msg:'Unsupported method. Use POST instead.'}));
});

// POST request process route and calls class
app.post(directConfig.classUrl, function(req, res) {
    directRouter.processRoute(req, res);
});


app.use(app.router);
app.use(express.static(global.PUBLIC));

//router
router.init(app);

app.listen(ServerConfig.port);
console.log('Listening on port '+ServerConfig.port);