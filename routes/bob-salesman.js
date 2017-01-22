const
	express = require('express'),
	request = require('request'),
	router = express.Router();

router.get('/', function(req, res) {
	console.log('in GET: ' + req.body.progress);
	sleep(5000);
	res.status(200).send({ progress: req.body.progress + 20 });
});

// TODO: receive two callback functions (updateCallBack and finishedCallBack)
function run(requesterID, callback, progress = 0) {
	console.log('running bob for execution %d', requesterID);
	
	console.log('sleep(10000) + progress call');
	sleep(10000);

	request({
		uri: 'http://localhost:5000/bob-salesman/',
		method: 'GET',
		json: { progress: progress }

	}, function (error, response, body) {
		console.log('Response to GET method, made to bob-salesman, received.')
		if (!error && response.statusCode == 200) {
			var curProgress = body.progress;
			console.log('Successfully GET: ' + curProgress);

			if (curProgress < 100) {
				console.log('< 100')
				callback(requesterID, 'progress: ' + curProgress);
				run(requesterID, callback, curProgress);
			} else {
				console.log('else')
				callback(requesterID, 'this will be the URL for answer file');
			}
		} else {
			console.error("Unable to send GET.");
			console.error(response);
			console.error(error);
		}
	});
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