const
	express = require('express'),
	request = require('request'),
	config = require('config');

const SERVER_URL = config.get('serverURL');

var progressIndicatorStatus = true;
var lastSentProgress = 0;

function getProgressIndicatorStatus() {
	return progressIndicatorStatus;
}

function changeProgressIndicatorStatus() {
	progressIndicatorStatus = !progressIndicatorStatus;
}

function getLastSentProgress() {
	return lastSentProgress;
}

function setLastSentProgress(newProgress) {
	lastSentProgress = newProgress;
}

function requestRouteCalculation(requesterID, payloads, sendTextMessage, sendFileMessage) {
	console.log('Running bob for requester: %d', requesterID);
	
	payloads.forEach(function(payload) {
		var options = {
			uri: SERVER_URL + '/requestRoute',
			method: 'POST',
			body: payload.url
		}

		var filename = getFileNameFromURL(payload.url);
		function sendTextMessageContainer(senderID, message, format = true) { 
			if (format)
				sendTextMessage(senderID, formatProgressMessagePerFile(filename, message));
			else
				sendTextMessage(senderID, message)
		}

		function recieveResponse(error, response, body) {
			if (!error && response.statusCode == 200) {
				var bodyObj = JSON.parse(body);
				var executionID = bodyObj.executionID;
				console.log('Successfully requested route calculation to the server. executionID: %d', executionID);
				
				followRouteCalculationProgress(requesterID, executionID, sendTextMessageContainer, sendFileMessage);

			} else {
				console.error('Unable to send POST to server simulation.');
				// console.error(response);
				// console.error(error);
			}
		}

		request(options, recieveResponse);
	});
}

function formatProgressMessagePerFile(url, progress) {
	return 'Route for file ' + (url) + ' is ' + progress + ' ready.'
}

function getFileNameFromURL(url) {
	return url.split('/').pop().split('#')[0].split('?')[0];
}

function followRouteCalculationProgress(requesterID, executionID, sendTextMessageContainer, sendFileMessage) {
	console.log('Getting PROGRESS for execution: %d', executionID);
	
	var options = {
		uri: SERVER_URL + '/getProgress',
		qs: { key: executionID },
		method: 'GET',
	}

	function recieveResponse(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Successfully get progress indicator from server');
			var bodyObj = JSON.parse(body);
			var curProgress = (bodyObj.progress)*100;

			if (curProgress < 100) {
				if (progressIndicatorStatus && getLastSentProgress() !== curProgress) {
					sendTextMessageContainer(requesterID, curProgress + '%');
					setLastSentProgress(curProgress);
				}

				followRouteCalculationProgress(requesterID, executionID, sendTextMessageContainer, sendFileMessage);
			} else {
				console.log('End of algorithm\'s execution.')
				sendTextMessageContainer(requesterID, 'Hey! Your request is complete, here is your results:', false);
				sendFileMessage(requesterID, SERVER_URL + '/download?key=' + executionID);
			}
		} else {
			console.error('Unable to send GET (PROGRESS).');
			// console.error(response);
			// console.error(error);
		}
	}

	request(options, recieveResponse);
}

// function getRouteResult(requesterID, executionID, sendFileMessage) {
// 	console.log('Getting RESULTS for execution: %d', executionID);
	
// 	var options = {
// 		uri: SERVER_URL + '/download',
// 		qs: { key: executionID },
// 		method: 'GET',
// 	}

// 	request(options, function (error, response, body) {
// 		if (!error && response.statusCode == 200) {

// 			console.log('Successfully get progress indicator from server');
// 			var bodyObj = JSON.parse(body);
// 			var resultURL = bodyObj.resultURL;
// 			sendFileMessage(requesterID, resultURL);

// 		} else {
// 			console.error('Unable to send GET (RESULT).');
// 			console.error(response);
// 			console.error(error);
// 		}
// 	});
// }

module.exports = {
	requestRouteCalculation: requestRouteCalculation,
	changeProgressIndicatorStatus: changeProgressIndicatorStatus,
	getProgressIndicatorStatus: getProgressIndicatorStatus
};