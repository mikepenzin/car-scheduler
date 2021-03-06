var mongoose = require('mongoose');


var RideSchema = new mongoose.Schema({
    name: String,
    personInfo: String,
    address: String,
    phoneNumber: String,
    currentStatus: {
        type: String, 
        default: "enabled"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride"
        }
    ],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    }
    
});

module.exports = mongoose.model("Vendor", RideSchema);