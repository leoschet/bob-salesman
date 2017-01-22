const
	express = require('express'),
	request = require('request'),
	x = 'alooo',
	router = express.Router();

console.log('bob: ' + x);

router.get('/', function(req, res) {
	res.render('index');
});

// function foo(str) {
// 	console.log(str);
// }

// app.use('/bob-salesman', bob.router);
// module.exports = {
// 					 foo: foo,
// 					 router: router
// 				 };
module.exports = router;