var fs = require('fs'),
   request = require('request');

// Load config defaults from JSON file.
// Environment variables override defaults.
exports.loadConfig = function loadConfig() {
   var config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf-8'));
   for (var i in config) {
      config[i] = process.env[i.toUpperCase()] || config[i];
   }
   return config;
};

exports.verify = function verify(app, assertion, idp, cb) {

   if (app && assertion) {

      request.post({
         url: idp,
         json: {
            assertion: assertion,
            audience: app
         }
      }, function (e, r, body) {
         if (body && body.email) {
            //Assertion accepted, user owns body.email

            cb(body.email);

         } else {
            cb(null);
         }
      });
   } else {
      cb(null);
   }

};