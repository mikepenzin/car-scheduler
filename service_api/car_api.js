var db = require('../models');

var carAPI = {};

carAPI.getCarById = function(car_id){
    return db.Car.findById(car_id);
};

carAPI.getAllCars = function(){
    return db.Car.find({});
};


module.exports = carAPI; 