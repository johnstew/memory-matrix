var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var path     = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

var config   = require('./config/config.js');
var configDB = require('./config/database.js');
var env = require('node-env-file');


try{
  env(__dirname + '/.env');
}catch(err){
  console.log('Error: '+err);
}

mongoose.connect(configDB[process.env.DB].url);

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup view engine for HAML
app.set('views', './app/views');
app.set('view engine', 'jade');

//static files
app.use(express.static('./public'));

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

require('./app/routes.js')(app);

app.listen(port);
console.log('MemoryMatrix started on port: ' + port);
