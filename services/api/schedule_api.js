var db = require('../../models');

var scheduleAPI = {};

scheduleAPI.getScheduledRideByDate = function(ride_id, date) {
    return db.Schedule.find({
        $and: [
            { date: { $eq: date } },
            { ride: { $eq: ride_id } }
        ]
    });
};

scheduleAPI.getScheduledCarsByDateAndTime = function(date, sTime, eTime) {
    return db.Schedule.find({
        $and: [
            { date: { $eq: date } },
            { startTime: { $gte: sTime, $lt: eTime } },
            { endTime: { $gt: sTime, $lte: eTime } }
        ]
    });
};



module.exports = scheduleAPI;
