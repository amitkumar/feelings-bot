var apiai = require('apiai');

// read the api.ai docs : https://api.ai/docs/

//Enter your API Key
var app = apiai("d4446299f04d468393a8a7ccf2ba9fa3");

// Function which returns speech from api.ai
var submit = function(sessionId, query) {
	console.log('dialogflow submit', sessionId, query);
	var request = app.textRequest(query, {
		sessionId: sessionId
	});
	const responseFromAPI = new Promise(
		function (resolve, reject) {
			request.on('error', function(error) {
				reject(error);
			});
			request.on('response', function(response) {
				resolve(response.result);
			});
		});
	request.end();
	return responseFromAPI;
};

// test the command :
//getRes('hello').then(function(res){console.log(res)});

module.exports = {submit}
