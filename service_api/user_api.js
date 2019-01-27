var db = require('../models');

var userAPI = {};

userAPI.getUserById = function(user_id){
    return db.User.findById(user_id);
};

userAPI.getAllUsers = function(){
    return db.User.find({});
};

userAPI.getUserByIdAndUpdate = function(user_id, update){
    return db.User.findByIdAndUpdate(user_id, update);
};

userAPI.getUserByIdAndRemove = function(user_id){
    return db.User.findByIdAndRemove(user_id);
};

userAPI.getUserByIdPopulateCompany = function(user_id){
    return db.User.findById(user_id).populate('company');
};

userAPI.getUserByIdPopulateCompanyVendors = function(user_id){
    console.log("HERE!!!!!", user_id);
    
    return db.User.findById(user_id).populate({ 
        path: 'company',
        populate: {
            path: 'vendors',
            model: 'Vendor'
        }
    });
};


module.exports = userAPI; 