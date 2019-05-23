var mongoose = require('mongoose');
var DateOnly = require('mongoose-dateonly')(mongoose);

var ScheduleSchema = new mongoose.Schema({
    name: String,
    personInfo: String,
    phoneNumber: String,
    date: DateOnly,
    startTime: Number,
    notes: String,
    endTime: Number,
    addresses: [{
        stopName: String,
        stopAddress: String,
        numberOfPeopleToCollect: Number,
        contactPerson: String,
        phoneNumber: String,
        notes: String,
        usedCars: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car"
        }]
    }],
    acceptedByDriver: {
        type: Boolean,
        default: false
    },
    priceBeforeVAT: {
        type: Number,
        default: 0
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride"
    }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
