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
    rideDate: {
        type: Date, 
        default: Date.now
    },
    startTime: Number,
    endTime: Number,
    addresses: [{
        stopName: String,
        stopAddress: String,
        numberOfPeopleToCollect: Number,
        phoneNumber: String
    }],
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
    usedCars: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car"
        }
    ],
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    }
});

module.exports = mongoose.model("Ride", RideSchema);