var db = require('../models');

var rideAPI = {};

rideAPI.getRideById = function(ride_id){
    return db.Ride.findById(ride_id);
};

rideAPI.getRideByIdAndPopulate = function(ride_id, populate){
    return db.Ride.findById(ride_id).populate(populate);
};

rideAPI.getAllRides = function(vendors_list){
    return db.Ride.find({ vendor: { $in: vendors_list } });
};

rideAPI.getAllRidesAndPopulate = function(vendors_list, populate){
    return db.Ride.find({ vendor: { $in: vendors_list } }).populate(populate);
};

rideAPI.createNewRide = function(data) {
    return db.Ride.create(data);  
};

rideAPI.updateRidebyId = function(ride_id, data) {
    return db.Ride.findByIdAndUpdate(ride_id, data);  
};

rideAPI.removeRidebyId = function(ride_id) {
    return db.Ride.findByIdAndRemove(ride_id);  
};

rideAPI.getRidesBetweeenDates = function(firstDate, secondDate, vendors_list){
    return db.Ride.find({ 
        $and: [
            { rideStartDate: { $lte: firstDate } },
            { rideEndDate: { $gte: secondDate } }, 
            { vendor: { $in: vendors_list } }
        ]
    });
};

rideAPI.getRidesForDate = function(firstDate, currentWeekDay, vendors_list){
    return db.Ride.find({ 
        $and: [
            { rideStartDate: { $lte: firstDate } },
            { rideEndDate: { $gte: firstDate } }, 
            { weekDays: { $in: currentWeekDay } },
            { vendor: { $in: vendors_list } }
        ]
    });
};

rideAPI.getRidesBetweeenDatesAndPopulate = function( firstDate, secondDate, vendors_list, populate ){
    return db.Ride.find({ 
        $and: [
            { rideStartDate: { $lte: firstDate } },
            { rideEndDate: { $gte: secondDate } }, 
            { vendor: { $in: vendors_list } }
        ]
    }).populate(populate);
};

module.exports = rideAPI; 