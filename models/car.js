var mongoose = require('mongoose');

    
var CarSchema = new mongoose.Schema({
    carName: String,
    carId: { 
        type: Number, 
        unique: true, 
        required: true, 
        dropDups: true 
    },
    licensePlate: String,
    model: String,
    numberOfSeats: {
        type: Number, 
        default: 0
    },
    manufactureYear: {
        type: Number, 
        default: 2018
    },
    currentStatus: {
        type: String, 
        default: "occupied"
    },
    isContractor: {
        type: Boolean,
        default: false
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Car", CarSchema);