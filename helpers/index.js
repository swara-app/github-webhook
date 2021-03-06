'use strict';

var debug = require('debug')('swara:helpers'),
  util = require('util'),
  JsSHA = require('jssha'),
  moment = require('moment'),
  deploy = require('../deploy'),
  email = require('../email'),
  Commit = require('../models/commit'),
  secret = process.env.SWARA_WEBHOOK_SECRET,
  SECOND = 1000,
  MINUTE = 60 * SECOND,
  NOTIFICATION_TIMER = 30 * MINUTE;

var helpers = {
  validateRequestSignatue : function (signature, commitData) {
    debug('Inside validateRequestSignatue...');
    // debug('signature: %s', signature);
    // debug('commitData: %s', commitData);
    var shaObj = new JsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(secret, 'TEXT');
    shaObj.update(commitData);
    var hmac = shaObj.getHMAC('HEX');
    return 'sha1=' + hmac === signature;
  },
  removeAllCommits        : function (res) {
    Commit.remove({}, function (err) {
      if (err) {
        var removeAllCommitsError = util.format('Remove all commits error: %s', err);
        debug(removeAllCommitsError);
        res.status(500).send(removeAllCommitsError);
      } else {
        debug('Commits have been removed');
      }
    });
  },
  countCommitClosure      : function (branchName) {
    return function (err, count) {
      /* global timers */
      if (err) {
        debug('Error in counting commits: %s', err);
      } else {
        debug('Number of commits in the database is %d', count);
        if (count === 3) {

          clearTimeout(timers[branchName]);
          debug('Timer for %s has been cleared.', branchName);

          debug('Beginning Deploy %s', moment().format());
          deploy.start(branchName);

          helpers.removeAllCommits();

        }
      }
    };
  },
  saveCommitClosure       : function (res, commitData, branchName) {
    return function (err /*, commit */) {
      if (err) {
        var saveCommitError = util.format('Save commit Error: %s', err);
        debug(saveCommitError);
        res.status(500).send(saveCommitError);
      } else {
        debug('Commit saved successfully...');
        // debug(commit);
        if (commitData.before === '0000000000000000000000000000000000000000') {
          debug('Received the first commit for the branch. Setting up the timer...');
          timers[branchName] = setTimeout(function () {
            debug('Timer has elapsed for the branch name %s and all the three commits haven\'t arrived yet.', branchName);
            email.sendAlert();
          }, NOTIFICATION_TIMER);
        } else {
          debug('The commit is not the first in this branch... No timer scheduled');
          Commit.count({branchName : branchName}, helpers.countCommitClosure(branchName));
        }
        res.status(200).send('Successfully processed the commit...');
      }
    };
  },
  processCommit           : function (commitData, res) {
    /* jshint camelcase: false */
    var branchRef = commitData.ref;
    var headCommit = commitData.head_commit;
    if ((/^refs\/heads\/deploy-/).test(branchRef) && headCommit) {
      var commitMessage = headCommit.message;

      var branchName = branchRef.substr(11);
      var isAppveyor = commitMessage.indexOf('(appveyor)') > -1;
      var isTravis = commitMessage.indexOf('(travis)') > -1;
      var isWercker = commitMessage.indexOf('(wercker)') > -1;
      var serviceName = isAppveyor ? 'appveyor' : isTravis ? 'travis' : 'wercker';

      debug('We\'re working with a deploy branch. Branch is : %s and Service is : %s', branchName, serviceName);

      var commit = new Commit({
        commitId    : headCommit.id,
        branchName  : branchName,
        serviceName : serviceName,
        appveyor    : isAppveyor,
        travis      : isTravis,
        wercker     : isWercker,
        created     : new Date(headCommit.timestamp)
      });

      commit.save(this.saveCommitClosure(res, commitData, branchName));
    } else {
      var nonDeployBranch = util.format('The branch committed to is not a deploy branch. Ref is: %s', branchRef);
      debug(nonDeployBranch);
      res.status(202).send(nonDeployBranch);
    }
  }
};

module.exports = helpers;
