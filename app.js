var express = require('express'),
	router = require('./app/router'),
	http = require('http'),
	path = require('path'),
	uuid = require('node-uuid'),
	crypto = require('crypto'),
	Sequelize = require('sequelize');

db = new Sequelize('test', 'postgres', '', {
      dialect: "postgres", // or 'sqlite', 'mysql', 'mariadb'
      port:    5432, // or 3306 (5432 for postgres)
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
global.Salt		 = '2a4c13fb6c774b43486450065a732af8';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(global.PUBLIC));



  
//router
router.init(app);

app.listen(8080);
console.log('Listening on port 8080');