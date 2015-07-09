'use strict';
var email = (function () {
  var nodemailer = require('nodemailer'),
    smtpTransport = nodemailer.createTransport('SMTP', {
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
      mailOptions.html = '<h1>Looks like one of the builds has failed to deploy</h1>';
      sendMail();
    },
    sendInfo  : function (branchName) {
      mailOptions.subject = '[swara-server] CI Deploy succeeded - Get ready to push to the website';
      mailOptions.html = '<h1>Installers from the branch ' + branchName + ' will get merged to `source` branch soon. Please do a grunt deploy soon...</h1>';
      sendMail();
    }
  };
})();

module.exports = email;
