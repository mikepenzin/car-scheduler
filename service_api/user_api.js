var db = require('../models');

var userAPI = {};

userAPI.getUserById = function(user_id){
    return db.User.findById(user_id);
};

userAPI.getAllUsers = function(sort){
    if (sort) {
        return db.User.find({}).sort(sort);
    } else {
        return db.User.find({});
    }
};

userAPI.getQuery = function(query){
    return db.User.find(query);
};

userAPI.createNewUser = function(user_obj, password) {
    return db.User.register(user_obj, password);
};

userAPI.getQueryAndPopulate = function(query, populate){
    return db.User.find(query).populate(populate);
};

userAPI.getUserByIdAndUpdate = function(user_id, update){
    return db.User.findByIdAndUpdate(user_id, update);
};

userAPI.getUserByIdAndRemove = function(user_id){
    return db.User.findByIdAndRemove(user_id);
};

userAPI.getUserByIdAndPopulate = function(user_id, populate){
    return db.User.findById(user_id).populate(populate);
};

module.exports = userAPI; 