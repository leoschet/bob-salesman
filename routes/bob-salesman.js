const
	express = require('express'),
	request = require('request'),
	router = express.Router();

router.get('/', function(req, res) {
	res.status(200).send({ progress: req.body.progress + 20 });
});

// TODO: receive two callback functions (updateCallBack and finishedCallBack)
function run(requesterID, callback) {
	console.log('running bob for execution %d', requesterID);
	
	var progress = 0;

	while (progress < 100) {

		console.log('sleep(500) + progress call');
		sleep(500);
		request({
			uri: 'https://bob-salesman.herokuapp.com/bob-salesman',
			method: 'GET',
			json: { progress: progress }

		}, function (error, response, body) {
			console.log('Response to GET method, made to bob-salesman, received.')
			if (!error && response.statusCode == 200) {
				console.log('Successfully GET');
				var curProgress = body.progress;

				callback(requesterID, 'progress: ' + curProgress);
			} else {
				console.error("Unable to send GET.");
				console.error(response);
				console.error(error);
			}
		});

	}

	return 'this will be the URL for answer file';
}

function makeRequestToJava(requesterID, progress) {
	// TODO: make request
	sleep(5000);
	return progress + 20;
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