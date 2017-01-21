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

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and assets located at this address. 
const SERVER_URL = config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
	console.error("Missing config values");
	process.exit(1);
}

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/webhook', function(req, res) {
	if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log("Webhook validated.");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log("Failed webhook validation. Check the validation tokens.");
		res.sendStatus(403);
	}
});

app.post('/webhook', function (req, res) {
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page') {
		
		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// Iterate over each messaging event
			entry.messaging.forEach(function(event) {
				if (event.message) {
					receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});

		// Assume all went well.
		res.sendStatus(200);
	}
});
	
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches a keyword and send back the example.
		// Otherwise, just echo the text we received.
		switch (messageText) {
			case 'generic':
				sendGenericMessage(senderID);
				break;

			case 'who are you?':
				sendTextMessage(senderID, 'I\'m a sample chatbot, I can only repeat what you say! How boring am I?');

			case 'help':
				sendTextMessage(senderID, 'I\'m a sample chatbot, I can only repeat what you say! How boring am I?');

			default:
				sendTextMessage(senderID, 'you said: ' + messageText);
		}
	} else if (messageAttachments) {
		sendTextMessage(senderID, "Message with attachment received");
	}
}

function sendGenericMessage(recipientId, messageText) {
	// To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
	// formats the data in the request
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;