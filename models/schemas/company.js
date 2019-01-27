var mongoose = require('mongoose');


// Schema setup
var companySchema = new mongoose.Schema({
    name: String,
    companyID: { 
        type: Number, 
        unique: true, 
        required: true, 
        dropDups: true 
    },
    companyLogo:  {
        url: {
            type: String, 
            default: "https://car-scheduler-penzin.c9db.User.s.io/assets/img/company_logo.png"
        }
    },
    address: String,
    city: String,
    phoneNumber1: String,
    phoneNumber2: String,
    contactPerson: String,
    active: {
        type: Boolean,
        default: true
    },
    paymentDate: {
        type: Date, 
        default: Date.now
    },
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    vendors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    }]
});

module.exports = mongoose.model("Company", companySchema);