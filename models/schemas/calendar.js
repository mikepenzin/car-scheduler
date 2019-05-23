var mongoose = require('mongoose');


var CalendarSchema = new mongoose.Schema({
    date: {
        type: Number,
        unique: true,
        required: true,
        dropDups: true
    },
    ridesData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride"
    }],
    usedCars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    }],
    startTimes: [{
        startTime: Number,
        carIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car"
        }],
        rideIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride"
        }]
    }],
    endTimes: [{
        endTime: Number,
        carIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car"
        }],
        rideIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride"
        }]
    }]
});

module.exports = mongoose.model("Calendar", CalendarSchema);
