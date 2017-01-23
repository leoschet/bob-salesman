const
	express = require('express'),
	request = require('request'),
	config = require('config'),
	router = express.Router();

const SERVER_URL = config.get('serverURL');

router.get('/', function(req, res) {
	console.log('Simulate GET request received by Java Server');
	sleep(10000);
	res.status(200).send({ progress: req.body.progress + 20 });
});

function run(requesterID, sendTextMessage, progress = 0) {
	console.log('Running bob for requester: %d', requesterID);
	
	var options = {
		uri: SERVER_URL + '/bob-salesman',
		method: 'GET',
		json: { progress: progress }
	}

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Successfully get progress indicator from server');
			var curProgress = body.progress;

			if (curProgress < 100) {
				sendTextMessage(requesterID, 'progress: ' + curProgress + '%');
				run(requesterID, sendTextMessage, curProgress);
			} else {
				sendTextMessage(requesterID, 'this will be the URL for answer file');
			}
		} else {
			console.error('Unable to send GET.');
			console.error(response);
			console.error(error);
		}
	});
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

module.exports = {
	api: {
		run: run
	},
	router: router
};
// module.exports = router;