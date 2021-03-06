var mongoose = require('mongoose');
var DateOnly = require('mongoose-dateonly')(mongoose);

var RideSchema = new mongoose.Schema({
    name: String,
    personInfo: String,
    phoneNumber: String,
    rideStartDate: DateOnly,
    rideEndDate: DateOnly,
    weekDays: [Number],
    startTime: Number,
    notes: String,
    endTime: Number,
    addresses: [{
        stopName: String,
        stopAddress: String,
        numberOfPeopleToCollect: Number,
        contactPerson: String,
        phoneNumber: String,
        stopTime: Number,
        notes: String
    }],
    rideType: {
        type: String,
        default: 'onetime'
    },
    saveForFutureUse: {
        type: Boolean,
        default: true
    },
    acceptedByDriver: {
        type: Boolean,
        default: false
    },
    numberOfPassengers: {
        type: Number,
        default: 0
    },
    priceBeforeVAT: {
        type: Number,
        default: 0
    },
    currentStatus: {
        type: String,
        default: "new"
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    }
});

module.exports = mongoose.model("Ride", RideSchema);
