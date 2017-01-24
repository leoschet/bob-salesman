const
	express = require('express'),
	router = express.Router();

var counter = -1;
var executions = [];

router.post('/requestRoute', function(req, res) {
	console.log('Simulate POST request (CALCULATE) received by Java Server');

	sleep(5000); // Simulate heavy processing

	counter += 1;
	executions[counter] = {
		progress: 0,
		fileURL: req.body.fileURL,
		result: 'Result is not ready'
	}

	var json = JSON.stringify({ executionID: counter });
	res.status(200).send(json);
});

router.get('/getProgressIndicator', function(req, res) {
	console.log('Simulate GET request (PROGRESS) received by Java Server');
	
	sleep(10000); // Simulate heavy processing

	var executionID = req.query['executionID'];
	executions[executionID].progress += 20;

	if (executions[executionID].progress >= 100) 
		executions[executionID].result = executions[executionID].fileURL;

	var json = JSON.stringify({ progress: executions[executionID].progress });
	res.status(200).send(json);
});

router.get('/getResult', function(req, res) {
	console.log('Simulate GET request (RESULT) received by Java Server');
	
	var executionID = req.query['executionID'];

	var json = JSON.stringify({ resultURL: executions[executionID].result });
	res.status(200).send(json);
});

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

module.exports = router;