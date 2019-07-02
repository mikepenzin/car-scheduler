var request     = require('request');
var dotenv      = require('dotenv');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

dotenv.load();

var smsAPI = {};

smsAPI.send = function(phoneNumber, message){
	console.log("### : ", process.env.SMS_API_KEY, phoneNumber, message);
	console.log(message);
	var messageData = {
		"content": message,
		"to": [
		phoneNumber
		],
		"binary": false,
		"clientMessageId": "uuid",
		"charset": "UTF-8"
	};
	
    var url = "https://platform.clickatell.com/messages/http/send?apiKey=" + process.env.SMS_API_KEY + "&to=" + phoneNumber + "&content=" + message;
    console.log("URL: " + url);
	
	// var xhr = new XMLHttpRequest();
	// xhr.open("GET", "https://platform.clickatell.com/messages/http/send?apiKey=J1ce8b3_Qf-zoGgL5z4f-A==&to=972544958954&content=" + message, true);
	// xhr.onreadystatechange = function(){
	// 	if (xhr.readyState == 4 && xhr.status == 200) {
	// 		console.log('success');
	// 	}
	// };
	// xhr.send();


	
	// request({
	// url: 'https://platform.clickatell.com/messages',
	// method: "POST",
	// headers: {
	// "Content-Type": "application/json",
	// 	"Authorization" : process.env.SMS_API_KEY
	// },
	// json: true,
	// body: messageData
	// }, function (error, resp, body) { 
	// 	console.log(resp.body);
	// });
	
		request(encodeURI(url), function(err, response, body){
		console.log(response.body);
		var resp = JSON.parse(response.body);
		if(resp.messages[0].accepted || resp.messages[0].error == null || response.statusCode == 200) {
		console.log('#######################');
		console.log('SMS was sent to: ' + phoneNumber);
		console.log('Message content: ', message);
		console.log('#######################');
		} else {
		console.log(err, response.status);
		}
		});
};

module.exports = smsAPI;