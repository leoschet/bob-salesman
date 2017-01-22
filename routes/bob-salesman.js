const
	express = require('express'),
	request = require('request'),
	router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

// TODO: receive two callback functions (updateCallBack and finishedCallBack)
function run(requesterID, callback) {
	console.log('running bob for execution %d', requesterID);
	
	var progress = 0;

	while (progress < 100) {
		progress = makeRequestToJava(requesterID, progress);
		callback(requesterID, 'progress: ' + progress);
	}

	// TODO: send file URL by finishedCallBack
	callback(requesterID, 'finished!');
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