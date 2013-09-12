var url = require('url'),
   http = require('http'),
   https = require('https'),
   express = require('express'),
   request = require('request'),
   utils = require('./lib/utils.js'),
   MongoClient = require('mongodb').MongoClient,
   app = express();


var config = utils.loadConfig();
var port = process.env.PORT || config.startier_port || 7777;
var mongoPath = "mongodb://" + config.mongo_user + ":" + config.mongo_pass + "@" + config.mongo_url;
var stars;

MongoClient.connect(mongoPath, function(err, db) {
   if(err) throw err;

   stars = db.collection('stars');

});

app.use(express.bodyParser());


app.listen(port, null, function (err) {
   if (err)
      console.log('Error: ' + err);
   console.log('StarTier, at your service: http://localhost:' + port);
});


// Convenience for allowing CORS on routes
app.all('*', function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET, POST');
   res.header('Access-Control-Allow-Headers', 'Content-Type');
   next();
});


app.post('/lookup', function (req, res) {
   console.log("/lookup");

   var app = req.headers.referer;
   var assertion = req.body.assertion;

   if (req.body.assertion) {
      //AUTH WITH PERSONA
      request.post({
         url: 'https://login.persona.org/verify',
         json: {
            assertion: assertion,
            audience: app
         }
      }, function (e, r, body) {
         if (body && body.email) {
            //Assertion accepted, user owns body.email


            //Lookup user

            //If exists, return StarDust url

            //If doesn't exist, create user record, return default StarDust provider url

            stars.insert({a:2}, function(err, docs) {

            });


            console.log(body.email);

            res.json({ success: body.email });
         } else {
            res.json({ success: false });
         }
      });
   }

});


app.post('/test', function(req, res){

   stars.insert({a:2}, function(err, docs) {
         console.log("err: " + err);
         console.log("docs: " + docs);
   });


});


