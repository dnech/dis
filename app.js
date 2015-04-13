var express = require('express');
var router = require('./app/router');
var http = require('http');
var path = require('path');
var uuid = require('node-uuid');

var Sequelize = require('sequelize');

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


//getytyty
  
//router
router.init(app);

app.listen(8080);
console.log('Listening on port 8080');
