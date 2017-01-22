const
	express = require('express'),
	config = require('config'),
	request = require('request'),
	bob = require("./bob-salesman.js").api,
	router = express.Router();

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

// bob.run(1, function(str, str2) {
// 	console.log(str + ': ' + str2);
// });

console.log('parada automatica')
sendTextMessage(1298664906839160, 'testando');

router.get('/', function(req, res) {
	if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log("Webhook validated.");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log("Failed webhook validation. Check the validation tokens.");
		res.sendStatus(403);
	}
});

var postProcessing;
router.post('/', function (req, res) {
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
					postProcessing = receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});

		// Assume all went well.
		console.log('Status 200 sent.')
		res.sendStatus(200);

		console.log('Initializing post processing.');
		postProcessing.method(postProcessing.senderID, postProcessing.callback);
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
				break;

			case 'help':
				sendTextMessage(senderID, 'Type something, don\'t be afraid!');
				break;

			case 'run bob':
				sendTextMessage(senderID, 'Ok, now I\'ll need some time to think... But don\'t worry, I\'ll send you a message when I\'m finished!');
				return {
					method: bob.run,
					senderID: senderID,
					callback: sendTextMessage
				}
				break;

			default:
				sendTextMessage(senderID, messageText);
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

function formatAttachment(type, playloadUrl) {
	var attachment = {
		type: type,
		payload: {
			url: playloadUrl
		}
	};

	return attachment;
}

function sendAttachmentMessage(recipientId, attachment) {
	// formats the data in the request
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: attachment
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	console.log('Sending message to facebook');
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		console.log('Response to POST method, made to facebook, received.')
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

module.exports = router;