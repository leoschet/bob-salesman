'use strict';

const
	express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	// crypto = require('crypto'), // necessary?
	// https = require('https'), // necessary?
	webhook = require("./routes/webhook.js"),
	bob = require("./routes/bob-salesman.js");

var app = express();
app.set('port', process.env.PORT || 5000);

app.set('views', './public/views');
app.set('view engine', 'pug');
app.engine('pug', pug.__express);

// app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('./public/static'));
app.use(bodyParser.json());

app.use('/webhook', webhook);
app.use('/bob-salesman', bob);

app.get('/', function(req, res) {
	res.render('index');
});

// Start server
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;