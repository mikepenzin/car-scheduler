var db = require('../models');

var rideAPI = {};

rideAPI.getRideById = function(ride_id){
    return db.Ride.findById(ride_id);
};

rideAPI.getRidesBetweeenDates = function(firstDate, secondDate){
    return db.Ride.find({ $and: [{ rideStartDate: { $lte: firstDate } }, { rideEndDate: { $gte: secondDate } }]});
};


module.exports = rideAPI; 