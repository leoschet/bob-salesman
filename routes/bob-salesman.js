const
	express = require('express'),
	request = require('request'),
	router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

// TODO: receive two callback functions (updateCallBack and finishedCallBack)
function run(executionID, callback) {
	console.log('running bob for execution %d', executionID);
	
	for (var i = 0; i < 5; i++) {
		// TODO: send progress indicator by updateCallBack
		setTimeout(() => { callback(executionID, 'in loop: ' + i); }, 5000);
	}
	
	// TODO: send file URL by finishedCallBack
	callback(executionID, 'finished!');
}

module.exports = {
	api: {
		run: run
	},
	router: router
};
// module.exports = router;