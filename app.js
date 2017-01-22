'use strict';

const
	express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	// https = require('https'),
	webhook = require("./webhook.js");

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('views', './public/views');
app.set('view engine', 'pug');
app.engine('pug', pug.__express);
// app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('./public/static'));
app.use(bodyParser.json());

app.use('/webhook', webhook);

app.get('/', function(req, res) {
	res.render('index');
});

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;