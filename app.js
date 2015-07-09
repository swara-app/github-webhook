'use strict';

var config = require('./config');
if (config.env === 'development') {
  process.env.DEBUG = 'swara:*';
}

var debug = require('debug')('swara:app'),
  express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('./mongoose'),
  app = express();

GLOBAL.timers = [];

if (config.env === 'development') {
  app.use(morgan('dev', {format : 'dev', immediate : true}));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended : true
}));

debug('Connecting to database connection...');
var connection = mongoose.connect();

var start = function () {
  debug('Setting up routes..');
  require('./routes')(app);

  app.listen(config.port);
  console.log('Listening on port %d', config.port);
};

exports.app = app;
exports.connection = connection;
exports.start = start;

if (config.env !== 'test') {
  start();
}
