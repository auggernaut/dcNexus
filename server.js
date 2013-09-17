var url = require('url'),
   http = require('http'),
   https = require('https'),
   express = require('express'),
   crypto = require('crypto'),
   nexus = require('./lib/nexus.js'),
   MongoClient = require('mongodb').MongoClient,
   app = express();


var config = nexus.loadConfig();
console.log('Configuration');
console.log(config);

var port = process.env.PORT || config.nexus_port || 7777;
var mongoPath = "mongodb://" + config.mongo_user + ":" + config.mongo_pass + "@" + config.mongo_uri;
var stars;

MongoClient.connect(mongoPath, function (err, db) {
   if (err) throw err;

   stars = db.collection('stars');

});

app.use(express.bodyParser());


app.listen(port, null, function (err) {
   if (err)
      console.log('Error: ' + err);
   console.log('Nexus, at your service: http://localhost:' + port);
});


// Convenience for allowing CORS on routes
app.all('*', function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET, POST');
   res.header('Access-Control-Allow-Headers', 'Content-Type');
   next();
});



app.post('/connect', function (req, res) {


   var newStar;

   nexus.verify(req.headers.referer, req.body.assertion, 'https://login.persona.org/verify', function (email) {

      if (email) {

         console.log("/connect success: " +  email);

         var naut = crypto.createHash("md5").update(email).digest("hex");

         stars.findOne({naut: naut}, function (err, doc) {
            if (doc) {
               res.json(doc);
            }
            else {
               newStar = { naut: naut, host: req.body.star };

               stars.insert(newStar, function (err, doc) {
                  res.json(doc[0]);
               });
            }
         });

      } else {
         console.log("/connect failure: " + req.headers.referer );
         res.json({ error: "invalid assertion" });
      }

   });

});



app.post('/star', function (req, res) {
   console.log("/star: " + req.body.naut);


   stars.findOne({naut: req.body.naut}, function (err, doc) {
      if (doc) {
         res.json({star: doc.host});
      }
      else {
         res.json({error: "user doesn't exist."});
      }
   });


});


app.post('/test', function (req, res) {

   var star = {
      email: "augman@gmail.com",
      star: "http://localhost:9999"
   }

   stars.insert(star, function (err, docs) {
      console.log("err: " + err);
      console.log("docs: " + docs);
   });


   stars.findOne({email: "augman@gmail.com"}, function (err, docs) {
      console.log("err: " + err);
      console.log("docs: " + docs);
   });

   res.json({res: "done"});


});


