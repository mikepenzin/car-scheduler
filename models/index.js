var mongoose = require('mongoose');
var dotenv   = require('dotenv');
dotenv.load();

mongoose.set('debug', true);
mongoose.connect(process.env.DATABASEURL);

mongoose.Promise = Promise;

module.exports.Calendar  = require("./schemas/calendar");
module.exports.Car       = require("./schemas/car");
module.exports.Company   = require("./schemas/company");
module.exports.Ride      = require("./schemas/ride");
module.exports.User      = require("./schemas/user");
module.exports.Vendor    = require("./schemas/vendor");