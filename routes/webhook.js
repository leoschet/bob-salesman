const
	express = require('express'),
	config = require('config'),
	request = require('request'),
	bob = require('./bob-salesman.js'),
	router = express.Router();

// Current environment in use (dev, production...)
const ENVIRONMENT = config.get('env');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and assets located at this address. 
const SERVER_URL = config.get('serverURL');

if (!(ENVIRONMENT && APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
	console.error('Missing config values.');
	process.exit(1);
}

// bob.requestRouteCalculation(1, ["https://cdn.fbsbx.com/v/t59.2708-21/16258786_1235915826492900_11060180737327104_n.txt/aaaa.txt?oh=ca91ed6743347746a2ac67af99cdf5c4&oe=5889D278"], function(id, msg) { console.log(msg) }, function(id, msg) { console.log(msg) });
// console.log('jogo continua');


router.get('/', function(req, res) {
	if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log('Webhook validated.');
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log('Failed webhook validation. Check the validation tokens.');
		res.sendStatus(403);
	}
});

var postProcessing;
router.post('/', function (req, res) {
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page' || ENVIRONMENT === 'dev') {
		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// Iterate over each messaging event
			entry.messaging.forEach(function(event) {
				if (event.message) {
					postProcessing = receivedMessage(event);
				} else {
					console.log('Webhook received unknown event: ', event);
				}
			});
		});

		// Assume all went well.
		console.log('Send status 200 as response to Facebook.')
		res.sendStatus(200);

		if (postProcessing) {
			console.log('Initialize post processment.');
			postProcessing.method(postProcessing.senderID, postProcessing.payloads, postProcessing.progressCallback, postProcessing.finishCallback);
		}
	}
});
	
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log('Received message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches a keyword and send back the example.
		// Otherwise, just echo the text we received.
		switch (messageText) {
			case 'help':
				sendTextMessage(senderID, 'TODO');
				break;

			case 'disable progress indicator':
				if (!bob.getProgressIndicatorStatus()) {
					sendTextMessage(senderID, 'It is already disabled.');
				} else {
					bob.changeProgressIndicatorStatus();
					sendTextMessage(senderID, 'Now it is disabled, to activate it back say: \'activate progress indicator\'.');
				}
					
				break;

			case 'activate progress indicator':
				if (bob.getProgressIndicatorStatus()) {
					sendTextMessage(senderID, 'It is already activated.');
				} else {
					bob.changeProgressIndicatorStatus();
					sendTextMessage(senderID, 'Now it is disabled, to activate it back say: \'disable progress indicator\'.');
				}
					
				break;

			default:
				sendTextMessage(senderID, messageText);
		}

	} else if (messageAttachments) {
		var payloads = [];
		messageAttachments.forEach(function(attachment) {
			switch (attachment.type) {
				case 'file':
					console.log('Add file to payloads queue');
					payloads.push(attachment.payload);
					break;
			}
		});
		
		if (payloads.length > 0) {
			sendTextMessage(senderID, 'Ok, now I\'ll need some time to think... But don\'t worry, I\'ll send you a message when I\'m finished!');
			return {
				method: bob.requestRouteCalculation,
				senderID: senderID,
				payloads: payloads,
				progressCallback: sendTextMessage,
				finishCallback: sendFileMessage
			}
		} else {
			sendTextMessage(senderID, 'I can only process attachments of type file... Sorry, bro');
		}
	}
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

function sendFileMessage(recipientId, playloadUrl) {
	console.log('AQUIIIIIIIIIII' + playloadUrl)
	// formats the data in the request
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "file",
				payload: {
					url: playloadUrl
				}
			}
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

			console.log('Successfully sent generic message with id %s to recipient %s', messageId, recipientId);
		} else {
			console.error('Unable to send message.');
			// console.error(response);
			console.error(error);
		}
	});
}

module.exports = router;