'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development',
  user = process.env.MONGO_USER_NAME,
  pass = process.env.MONGO_USER_PASS;

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
    db    : 'mongodb://' + user + ':' + pass + '@oceanic.mongohq.com:10043/app25185432'
  }
};

module.exports = config[env];
