var express         = require("express");
var mongoose        = require("mongoose");
var companyModel    = require('../models/company');
var userModel       = require('../models/user');
var carModel        = require('../models/car');
var middleware      = require('../middleware');
var router          = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now().toLocaleString('it-IT'));
  next();
});

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
}

//GET - Show general cars route
router.get("/", middleware.isLoggedIn, function(req, res){
  var drivers = [];
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'cars',
       model: 'Car'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    companyModel.findById(foundUser.company._id)
      .populate('users')
      .exec(function(err, foundCompany){
        if (err) { console.log(err); }
      
        for (var i = 0; i < foundCompany.users.length; i++) {
          if (foundCompany.users[i].role == 'driver' && !foundCompany.users[i].isAttachedToCar) {
            drivers.push(foundCompany.users[i]);
          }
        }
      
        companyModel.findById(foundUser.company._id)
        .populate({ 
           path: 'cars',
           populate: {
             path: 'driver',
             model: 'User'
           }
        })
        .exec(function(err, foundCars){
          if (err) { console.log(err); }
          
          carModel.find({}, function(err, foundCarForID){
            
            if (foundCarForID) { foundCarForID.sort(dynamicSort('carId')); }
            var carIdNumber = foundCarForID.length > 0 ? (foundCarForID[foundCarForID.length-1].carId + 1) : 10;
            
            res.render("cars/show", {user: foundUser, drivers:drivers, carIdNumber: carIdNumber, cars: foundCars.cars});
          });
        });
    });
  });
});

//POST - Add car route
router.post("/", middleware.isLoggedIn, function(req, res){
    var newCar = new carModel({
        carName: req.body.carName,
        licensePlate: req.body.licensePlate,
        model:  req.body.model,
        carId: req.body.carId,
        numberOfSeats: req.body.numberOfSeats,
        manufactureYear: req.body.manufactureYear,
        isContractor: (req.body.isContractor === 'true' ? true : false)
    });
    
    userModel.findById(req.user.id).populate('company')
    .exec(function(err, foundUser){
      if (err) { console.log(err); }
      
      companyModel.findById(foundUser.company._id).exec(function(err, company){
          if (err) { console.log(err); }
          
          carModel.create(newCar, function (err, createdCar){
              if (err) { console.log(err); }
              
              if (!createdCar.isContractor) {
                userModel.findById(req.body.driverID, function(err, foundDriver){
                  if (err) { console.log(err); }
                  
                  console.log(createdCar, foundDriver);
                  createdCar.driver = foundDriver;
                  createdCar.save();
                  
                  foundDriver.isAttachedToCar = true;
                  foundDriver.save();
                  
                  company.cars.push(createdCar);
                  company.save();
                  
                  res.redirect("/company/" + company._id + "/cars");
                });
              } else {
                company.cars.push(createdCar);
                company.save();
                
                res.redirect("/company/" + company._id + "/cars");
              }
          });
      });
  });
});


//GET - Show one car route
router.get("/:car_id/edit", middleware.isLoggedIn, function(req, res){
  console.log(req.params.car_id);
  var drivers = [];
  carModel.findById(req.params.car_id).populate('driver').exec(function(err, foundCar){
    if (err) { console.log(err); }
    console.log(foundCar.driver);
    
    userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
      if (err) { console.log(err); }
      
      companyModel.findById(foundUser.company._id)
      .populate('users')
      .exec(function(err, foundCompany){
        if (err) { console.log(err); }
        
        for (var i = 0; i < foundCompany.users.length; i++) {
          if (foundCompany.users[i].role == 'driver') {
            drivers.push(foundCompany.users[i]);
          }
        }
        console.log(drivers, foundCar);

        res.render("cars/update", {drivers:drivers, car: foundCar, user:foundUser});
      });
    });
  });
});

//PUT - Update selected car route
router.put("/:car_id/edit", middleware.isLoggedIn, function(req, res){
  
  var updateCar = {
    carName: req.body.carName,
    licensePlate: req.body.licensePlate,
    model:  req.body.model,
    numberOfSeats: req.body.numberOfSeats,
    manufactureYear: req.body.manufactureYear
  };
  
  userModel.findById(req.user.id).populate('company')
  .exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    companyModel.findById(foundUser.company._id).exec(function(err, company){
        if (err) { console.log(err); }
        
        carModel.findByIdAndUpdate(req.params.car_id, updateCar, function(err, updatedCar){
            if (err) { console.log(err); }
            
            console.log("###########################");
            console.log(updatedCar);
            console.log("###########################");
            
            if(updatedCar.isContractor) {
              res.redirect("/company/" + company._id + "/cars");
            } else {
              var oldDriver = updatedCar.driver;
              var newDriver = req.body.driverID;
              console.log("Old and new drivers: ", oldDriver, newDriver);
              
              // If no old and new driver defined
              if (!oldDriver && (!newDriver && newDriver == 'undefined')) {
                
                res.redirect("/company/" + company._id + "/cars");
              
              // If no old driver defined but new does defined  
              } else if ( !oldDriver && (newDriver && newDriver != 'undefined') ) {
                
                userModel.findById(newDriver, function(err, foundNewDriver){
                  if (err) { console.log(err); }
                  
                  // If found user is already attached to car need to detach and reattach to currently updated car. 
                  if (foundNewDriver.isAttachedToCar) {
                    carModel.findOne({ driver: newDriver }, function(err, foundCarToUpdate){
                      if (err) { console.log(err); }
                      
                      foundCarToUpdate.driver = undefined;
                      foundCarToUpdate.save();
                      updatedCar.driver = foundNewDriver;
                      updatedCar.save();
                      
                      res.redirect("/company/" + company._id + "/cars");
                    });
                  } else {
                      foundNewDriver.isAttachedToCar = true;
                      foundNewDriver.save();
                      updatedCar.driver = foundNewDriver;
                      updatedCar.save();
                      
                      res.redirect("/company/" + company._id + "/cars");
                  }
                });
                
              // If old driver defined but new not
              } else if ( oldDriver && newDriver == 'undefined') {
                userModel.findById(oldDriver, function(err, foundOldDriver){
                  if (err) { console.log(err); }
                  
                  foundOldDriver.isAttachedToCar = false;
                  foundOldDriver.save();
                  updatedCar.driver = undefined;
                  updatedCar.save();
                  
                  res.redirect("/company/" + company._id + "/cars");
                  
                });
              
              // If both old and new driver defined and new is different than old
              } else if( (oldDriver && (newDriver || newDriver != 'undefined')) && (oldDriver != newDriver) ) {
                userModel.findById(oldDriver, function(err, foundOldDriver){
                  if (err) { console.log(err); }
                  
                  foundOldDriver.isAttachedToCar = false;
                  foundOldDriver.save();
                  
                  userModel.findById(newDriver, function(err, foundNewDriver){
                    if (err) { console.log(err); }
                  
                    // If found user is already attached to car need to detach and reattach to currently updated car. 
                    if (foundNewDriver.isAttachedToCar) {
                      carModel.findOne({ driver: newDriver }, function(err, foundCarToUpdate){
                        if (err) { console.log(err); }
                        
                        foundCarToUpdate.driver = undefined;
                        foundCarToUpdate.save();
                        updatedCar.driver = foundNewDriver;
                        updatedCar.save();
                        
                        res.redirect("/company/" + company._id + "/cars");
                      });
                    } else {
                        foundNewDriver.isAttachedToCar = true;
                        foundNewDriver.save();
                        updatedCar.driver = foundNewDriver;
                        updatedCar.save();
                        
                        res.redirect("/company/" + company._id + "/cars");
                    }
                  });
                });
              } else {
                res.redirect("/company/" + company._id + "/cars");
              }
            }
          });
      });    
  });
});


//DELETE - Delete car route
router.delete("/:id", middleware.isLoggedIn, function(req, res){
  
  carModel.findById(req.params.id, function(err, foundCar) {
    if (err) { console.log(err); }

    // If car is not contractor we need to update driver that he is not attached to car
    if ((foundCar.driver && foundCar.driver != undefined) && !foundCar.isContractor) {
      carModel.findById(req.params.id).populate('driver').exec(function(err, newFoundCar) {
        if (err) { console.log(err); }
        
        removeCarFromCompanyList(req.user.id, req.params.id);
        var driver = {};
        driver.isAttachedToCar = false;
        console.log(newFoundCar.driver);
        userModel.findByIdAndUpdate(newFoundCar.driver._id, driver, function(err, updatedUser){
          if (err) { console.log(err); }
          
          carModel.findByIdAndRemove(req.params.id, function(err, user){
            if (err) {
               console.log(err);
               res.redirect("back");
            } else {
               res.redirect("back");
            }        
          }); 
        });
      });  
    } else {
      // Remove company is case no driver attached
      removeCarFromCompanyList(req.user.id, req.params.id);
      
      carModel.findByIdAndRemove(req.params.id, function(err, car){
        if (err) {
           console.log(err);
           res.redirect("back");
        } else {
           res.redirect("back");
        }        
      });
    }
  });
});


function removeCarFromCompanyList(user_id, car_id) {
  userModel.findById(user_id, function(err, foundUser){
    if (err) { console.log(err); }
    
    companyModel.findById(foundUser.company, function(err, foundCompany){
      if (err) { console.log(err); }
      
      var carIndex = foundCompany.cars.indexOf(car_id);
      if (carIndex != -1) {
        foundCompany.cars.splice(carIndex, 1);
        foundCompany.save();
      }
      
    });
  });
}

module.exports = router;