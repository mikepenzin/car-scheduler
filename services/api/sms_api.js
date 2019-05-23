var request     = require('request');
var dotenv      = require('dotenv');

dotenv.load();

var smsAPI = {};

smsAPI.send = function(phoneNumber, message){
    var url = "https://platform.clickatell.com/messages/http/send?apiKey=" + process.env.SMS_API_KEY + "&to=" + phoneNumber + "&content=" + message;
    
    request(encodeURI(url), function(err, response, body){
        if( response.statusCode == 200) {
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