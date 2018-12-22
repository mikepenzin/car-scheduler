var mongoose = require('mongoose');
    
var RideSchema = new mongoose.Schema({
    name: String,
    rideID: { 
        type: Number, 
        unique: true, 
        required: true, 
        dropDups: true 
    },
    personInfo: String,
    phoneNumber: String,
    rideStartDate: String,
    rideEndDate: String,
    weekDays: [Number],
    startTime: String,
    endTime: String,
    addresses: [{
        stopName: String,
        stopAddress: String,
        numberOfPeopleToCollect: Number,
        contactPerson: String,
        phoneNumber: String
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
    usedCars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    }],
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    }
});

module.exports = mongoose.model("Ride", RideSchema);