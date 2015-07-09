'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var config = {
  development : {
    env   : env,
    root  : rootPath,
    mongo : {},
    app   : {
      name : 'swara-server-webhook'
    },
    port  : 1337,
    db    : 'mongodb://localhost/swara-server-webhook-development'
  },
  test        : {
    env   : env,
    root  : rootPath,
    mongo : {},
    app   : {
      name : 'swara-server-webhook'
    },
    port  : 1337,
    db    : 'mongodb://localhost/swara-server-webhook-test'
  },
  production  : {
    env   : env,
    root  : rootPath,
    mongo : {},
    app   : {
      name : 'swara-server-webhook'
    },
    port  : process.env.PORT,
    db    : process.env.MONGOLAB_URI
  }
};

module.exports = config[env];
