'use strict';
var email = (function () {
  var nodemailer = require('nodemailer'),
    smtpTransport = nodemailer.createTransport({
      service : 'Gmail',
      auth    : {
        user : 'flickr.downloadr.webhook@gmail.com',
        pass : process.env.SWARA_WEBHOOK_EMAIL_PASSWORD
      }
    }),
    mailOptions = {
      from : 'Swara-Server-Webhook <flickr.downloadr.webhook@gmail.com>',
      to   : 'imbleedingme@googlemail.com'
    },
    sendMail = function () {
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log('Message sent: ' + response.message);
        }
        smtpTransport.close();
      });
    };
  return {
    sendAlert : function () {
      mailOptions.subject = '[swara-server] CI Deploy might have failed';
      mailOptions.html = '<h3>Looks like one of the builds has failed to deploy</h3>';
      sendMail();
    },
    sendInfo  : function (branchName) {
      mailOptions.subject = '[swara-server] CI Deploy succeeded - A new GitHub Release is up!';
      mailOptions.html = '<h3>Installers from the branch <strong>' + branchName + '</strong> has been published as a new release on GitHub.</h3>';
      sendMail();
    }
  };
})();

module.exports = email;
