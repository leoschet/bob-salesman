const
	express = require('express'),
	request = require('request'),
	config = require('config');

const SERVER_URL = config.get('serverURL');

var progressIndicatorStatus = true;

function getProgressIndicatorStatus() {
	return progressIndicatorStatus;
}

function changeProgressIndicatorStatus() {
	progressIndicatorStatus = !progressIndicatorStatus;
}

function requestRouteCalculation(requesterID, filesURLs, sendTextMessage, sendFileMessage) {
	console.log('Running bob for requester: %d', requesterID);
	
	filesURLs.forEach(function(fileURL) {
		var options = {
			uri: SERVER_URL + '/bob-salesman-ws/requestRoute',
			method: 'POST',
			json: { fileURL: fileURL }
		}

		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var executionID = body.executionID;
				console.log('Successfully requested route calculation to the server. executionID: %d', executionID);
				followRouteCalculationProgress(requesterID, executionID, function(senderID, progress) { 
					sendTextMessage(senderID, formatProgressMessagePerFile(fileURL, progress));
				}, sendFileMessage);
			} else {
				console.error('Unable to send POST to server simulation.');
				console.error(response);
				console.error(error);
			}
		});
	});
}

function formatProgressMessagePerFile(url, progress) {
	return 'Route for file ' + getFileNameFromURL(url) + ' is ' + progress + ' ready.'
}

function getFileNameFromURL(url) {
	return url.split('/').pop().split('#')[0].split('?')[0];
}

function followRouteCalculationProgress(requesterID, executionID, sendTextMessage, sendFileMessage) {
	console.log('Getting PROGRESS for execution: %d', executionID);
	
	var options = {
		uri: SERVER_URL + '/bob-salesman-ws/getProgressIndicator',
		qs: { executionID: executionID },
		method: 'GET',
	}

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Successfully get progress indicator from server');
			var bodyObj = JSON.parse(body);
			var curProgress = bodyObj.progress;

			if (curProgress < 100) {
				if (progressIndicatorStatus) {
					sendTextMessage(requesterID, curProgress + '%');
				}

				followRouteCalculationProgress(requesterID, executionID, sendTextMessage, sendFileMessage);
			} else {
				sendTextMessage(requesterID, 'Hey! Your request is complete, here is your results:');
				getRouteResult(requesterID, executionID, sendFileMessage);
			}
		} else {
			console.error('Unable to send GET (PROGRESS).');
			console.error(response);
			console.error(error);
		}
	});
}

function getRouteResult(requesterID, executionID, sendFileMessage) {
	console.log('Getting RESULTS for execution: %d', executionID);
	
	var options = {
		uri: SERVER_URL + '/bob-salesman-ws/getResult',
		qs: { executionID: executionID },
		method: 'GET',
	}

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			console.log('Successfully get progress indicator from server');
			var bodyObj = JSON.parse(body);
			var resultURL = bodyObj.resultURL;
			sendFileMessage(requesterID, resultURL);

		} else {
			console.error('Unable to send GET (RESULT).');
			console.error(response);
			console.error(error);
		}
	});
}

// function run(requesterID, sendTextMessage, progress = 0) {
// 	console.log('Running bob for requester: %d', requesterID);
	
// 	var options = {
// 		uri: SERVER_URL + '/bob-salesman',
// 		method: 'GET',
// 		json: { progress: progress }
// 	}

// 	request(options, function (error, response, body) {
// 		if (!error && response.statusCode == 200) {
// 			console.log('Successfully get progress indicator from server');
// 			var curProgress = body.progress;

// 			if (curProgress < 100) {
// 				if (progressIndicatorStatus)
// 					sendTextMessage(requesterID, 'progress: ' + curProgress + '%');

// 				run(requesterID, sendTextMessage, curProgress);
// 			} else {
// 				sendTextMessage(requesterID, 'this will be the URL for answer file');
// 			}
// 		} else {
// 			console.error('Unable to send GET.');
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