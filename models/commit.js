'use strict';

var mongoose = require('mongoose'),
  commitSchema = new mongoose.Schema({
    commitId    : {type : String, unique : true, required : true},
    branchName  : {type : String, required : true},
    serviceName : {type : String, required : true},
    appveyor    : {type : Boolean, default : false},
    travis      : {type : Boolean, default : false},
    wercker     : {type : Boolean, default : false},
    created     : Date,
    updated     : {type : Date, default : Date.now}
  });

commitSchema.index({branchName : 1, serviceName : 1}, {unique : true});

module.exports = mongoose.model('Commit', commitSchema);
