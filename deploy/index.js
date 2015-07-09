'use strict';

exports.start = function (branchName) {

  var debug = require('debug')('swara:deploy'),
    email = require('../email'),
    fs = require('fs'),
    exec = require('child_process').exec,
    git = require('gift'),
    util = require('util'),
    moment = require('moment'),
    rimraf = require('rimraf'),
    releasesRepo = util.format('https://%s:@github.com/swara-app/releases.git', process.env.SWARA_WEBHOOK_SECRET),
    cloneDir = util.format('/tmp/releasesRepo-%s', moment().format('YYYY-MM-DD-HH-mm-ss-SSS'));

  var committerName = 'Swara Server Webhook';
  var committerEmail = 'swara.app@gmail.com';

  var setupGitIdentity = function (callback) {
    var command = 'git config --global user.email "' + committerEmail + '" && git config --global user.name "' + committerName + '"';
    var cmd = exec(command, {}, function (error) {
      if (error) {
        debug('Error in setupGitIdentity:cp:exec : %s', error);
        throw error;
      }
      debug('done setting up the git identity');
      callback();
    });
    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
  };

  debug('About to clone the releases repo...');

  git.clone(releasesRepo, cloneDir, function (err, repo) {
    if (err) {
      debug('Error cloning the releases repo: %s', err);
      throw err;
    } else {
      debug('Cloned release repo into %s', cloneDir);
      var branchFile = util.format('%s/branch', cloneDir);
      fs.readFile(branchFile, {encoding : 'utf8'}, function (err, data) {
        if (err) {
          debug('Error reading the branch file: %s', err);
          throw err;
        } else {
          var currentBranch = data.slice(0, data.indexOf('\n'));
          debug('currentBranch: \'%s\'', currentBranch);
          debug('branchName   : \'%s\'', branchName);
          if (currentBranch !== branchName) {
            fs.writeFile(branchFile, branchName + '\n', function (err) {
              if (err) {
                debug('Error writing to the branch file: %s', err);
                throw err;
              } else {
                repo.add(branchFile, function (err) {
                  if (err) {
                    debug('Error in git:add the modified branch file: %s', err);
                    throw err;
                  } else {
                    setupGitIdentity(function () {
                      repo.commit(util.format('updated to %s', branchName), {author : committerName + ' <' + committerEmail + '>'}, function (err) {
                        if (err) {
                          debug('Error in git:commit the modified branch file: %s', err);
                          throw err;
                        } else {
                          /* jshint camelcase: false */
                          repo.remote_push('origin', function (err) {
                            if (err) {
                              debug('Error in git:push: %s', err);
                              throw err;
                            } else {
                              rimraf(cloneDir, function (err) {
                                if (err) {
                                  debug('Error in rimraf (1) cloneDir: %s', err);
                                  throw err;
                                } else {
                                  debug('Deploy completed for branch \'%s\' at %s', branchName, moment().format());
                                  email.sendInfo(branchName);
                                }
                              });
                            }
                          });
                        }
                      });
                    });
                  }
                });
              }
            });
          } else {
            rimraf(cloneDir, function (err) {
              if (err) {
                debug('Error in rimraf (2) cloneDir: %s', err);
                throw err;
              } else {
                debug('Nothing to deploy. Finishing up at %s', branchName, moment().format());
              }
            });
          }
        }
      });
    }
  });

};
