var mongoose                = require('mongoose');
var DateOnly                = require('mongoose-dateonly')(mongoose);
var passportLocalMongoose   = require("passport-local-mongoose");
    
    
var userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true, 
        dropDups: true 
    },
    password: String,
    passwordToken: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    address: String,
    userPic: {
        url: {
            type: String, 
            default: "/assets/img/user_placeholder_man.jpg"
        }
    },
    currentStatus: {
        type: String, 
        default: "employed"
    },
    role:  {
        type: String, 
        default: "driver"
    },
    isAttachedToCar: {
        type: Boolean,
        default: false
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    ride: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);