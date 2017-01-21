'use strict';

const
	bodyParser = require('body-parser'),
	config = require('config'),
	crypto = require('crypto'),
	express = require('express'),
	https = require('https'),  
	request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'pug');
app.engine('pug', require('pug').__express);
// app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.set('views', __dirname + '/public/views');
app.use(express.static(__dirname + '/public/static'));
app.use(bodyParser.json());

console.log(process.env.MESSENGER_APP_SECRET);
// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

console.log(process.env.MESSENGER_VALIDATION_TOKEN);
// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

console.log(process.env.MESSENGER_PAGE_ACCESS_TOKEN);
// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

console.log(process.env.SERVER_URL);
// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get('/', function(req, res){
	res.render('index');
});

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;