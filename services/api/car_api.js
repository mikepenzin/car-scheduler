var db = require('../../models');

var carAPI = {};

carAPI.getCarById = function(car_id){
    return db.Car.findById(car_id);
};

carAPI.getAllCars = function(sort){
    if (sort) {
        return db.Car.find({}).sort(sort);
    } else {
        return db.Car.find({});
    }
};

carAPI.getCarByIdAndUpdate = function(car_id, update){
    return db.Car.findByIdAndUpdate(car_id, update);
};

carAPI.getOneCar = function(data){
    return db.Car.findOne(data);
};

carAPI.createCar = function(data){
    return db.Car.create(data);
};

carAPI.getCarByIdAndPopulate = function(car_id, populate){
    return db.Car.findById(car_id).populate(populate);
};

carAPI.removeCarById = function(car_id) {
    return db.Car.findByIdAndRemove(car_id);
};

module.exports = carAPI; 