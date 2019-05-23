var express         = require("express");
var api             = require("../services/api");
var middleware      = require('../middleware');
var router          = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});

//GET - Show general cars route
router.get("/", middleware.isUserSteward, function(req, res){
  // var drivers = [];
  
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'cars',model: 'Car'}})
  .then(function(foundUser){
      
    api.User.getQuery({ 
        $and: [
            { isActivated: { $eq: true } }, 
            { isAttachedToCar: { $eq: false } },
            { role: { $eq: 'driver' } },
            { company: { $eq: foundUser.company._id } }
        ]
    })
    .then(function(drivers) {   
        res.render("cars/show", {user: foundUser, drivers:drivers});
    });
  });
});

//GET - get all cars as array
router.get("/getAllCars",  function(req, res){
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'cars',model: 'Car'}})
  .then(function(foundUser){
      
    api.Company.getCompanyByIdAndPopulate(foundUser.company._id, {path: 'cars', populate: {path: 'driver', model: 'User'}})
      .then(function(foundCars) {
        
        res.json({data:foundCars.cars});
    });
    
  });
});

//POST - Add car route
router.post("/", middleware.isUserSteward, function(req, res){
    console.log('HERE!!!', req.body);
    
    var newCar = {
      carName: req.body.carName,
      licensePlate: req.body.licensePlate,
      model: req.body.model,
      numberOfSeats: req.body.numberOfSeats,
      manufactureYear: req.body.manufactureYear,
      isContractor: req.body.isContractor === 'true' ? true : false
    };
    
    api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(foundUser){

      api.Company.getCompanyById(foundUser.company._id)    
        .then(function(company){
          
          api.Car.createCar(newCar)
            .then(function(createdCar){
              
              if (!createdCar.isContractor) {

                api.User.getUserById(req.body.driverID)
                .then(function(foundDriver){
                    createdCar.driver = foundDriver;
                    createdCar.save();
                    
                    foundDriver.isAttachedToCar = true;
                    foundDriver.save();
                    
                    company.cars.push(createdCar);
                    company.save();
                    
                    res.json(createdCar);
                });
              } else {
                company.cars.push(createdCar);
                company.save();
                
                res.json(createdCar);
              }
          });
      });
  });
});

//GET - Show one car route
router.get("/:car_id/edit", middleware.isUserSteward, function(req, res){
  console.log(req.params.car_id);
  var drivers = [];

  api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(foundUser){
    
    api.Car.getCarByIdAndPopulate(req.params.car_id, 'driver')
    .then(function(foundCar){  

      api.Company.getCompanyByIdAndPopulate(foundUser.company._id, 'users') 
        .then(function(foundCompany){  
          
          for (var i = 0; i < foundCompany.users.length; i++) {
            if (foundCompany.users[i].role == 'driver') {
              drivers.push(foundCompany.users[i]);
            }
          }
          res.render("cars/update", {drivers:drivers, car: foundCar, user:foundUser});
      });
    });
  });
});

//PUT - Update selected car route
router.put("/:car_id/edit", middleware.isUserSteward, function(req, res){
  
  var updateCar = {
    carName: req.body.carName,
    licensePlate: req.body.licensePlate,
    model:  req.body.model,
    numberOfSeats: req.body.numberOfSeats,
    manufactureYear: req.body.manufactureYear
  };
  
  api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(foundUser){
    
    api.Company.getCompanyById(foundUser.company._id)  
      .then(function(company){
      
      api.Car.getCarByIdAndUpdate(req.params.car_id, updateCar)
        .then(function(updatedCar){
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
                
                console.log("THERE!!!!", newDriver);
                api.User.getUserById(newDriver)  
                  .then(function(foundNewDriver){
                    // If found user is already attached to car need to detach and reattach to currently updated car. 
                    if (foundNewDriver.isAttachedToCar) {
                      api.Car.getOneCar({ driver: newDriver })
                      .then(function(foundCarToUpdate){
                          
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
                })
                .catch(function(err){
                  console.log(err);
                });
                
              // If old driver defined but new not
              } else if ( oldDriver && newDriver == 'undefined') {
                api.User.getUserById(oldDriver)  
                .then(function(foundOldDriver){
                  foundOldDriver.isAttachedToCar = false;
                  foundOldDriver.save();
                  updatedCar.driver = undefined;
                  updatedCar.save();
                    
                  res.redirect("/company/" + company._id + "/cars");
                }).
                catch(function(err){
                  console.log(err);
                });
              
              // If both old and new driver defined and new is different than old
              } else if( (oldDriver && (newDriver || newDriver != 'undefined')) && (oldDriver != newDriver) ) {
                api.User.getUserById(oldDriver)  
                  .then(function(foundOldDriver){
                    
                    foundOldDriver.isAttachedToCar = false;
                    foundOldDriver.save();
                    
                    api.User.getUserById(newDriver)  
                      .then(function(foundNewDriver){
                        // If found user is already attached to car need to detach and reattach to currently updated car. 
                        if (foundNewDriver.isAttachedToCar) {
                          api.Car.getOneCar({ driver: newDriver })  
                          .then(function(foundCarToUpdate){
                            foundCarToUpdate.driver = undefined;
                            foundCarToUpdate.save();
                            updatedCar.driver = foundNewDriver;
                            updatedCar.save();
                            
                            res.redirect("/company/" + company._id + "/cars");
                          }).
                          catch(function(err){
                            console.log(err);
                          });
                        } else {
                            foundNewDriver.isAttachedToCar = true;
                            foundNewDriver.save();
                            updatedCar.driver = foundNewDriver;
                            updatedCar.save();
                            
                            res.redirect("/company/" + company._id + "/cars");
                        }
                  }).
                  catch(function(err){
                    console.log(err);
                  });
                }).
                catch(function(err){
                  console.log(err);
                });
              } else {
                res.redirect("/company/" + company._id + "/cars");
              }
            }
          });
      });    
  });
});

//GET - Vendor route to update status 
router.put("/:id/change-status",  middleware.isUserSteward, function(req, res){

    var isActive = {isActive: req.body.isActive == 'true'};
    console.log(req.params.id, isActive);

    api.Car.getCarByIdAndUpdate(req.params.id, isActive)
    .then(function(car){
      
      res.json(isActive);
    })
    .catch(function(err){
      console.log(err);
    });
});

//DELETE - Delete car route
router.delete("/:id", middleware.isUserSteward, function(req, res){
  
  api.Car.getCarById(req.params.id)
  .then(function(foundCar){
    // If car is not contractor we need to update driver that he is not attached to car
    if ((foundCar.driver && foundCar.driver != undefined) && !foundCar.isContractor) {
  
      api.Car.getCarByIdAndPopulate(req.params.id, 'driver')
      .then(function(newFoundCar){  
        
        removeCarFromCompanyList(req.user.id, req.params.id);
        var driver = {};
        driver.isAttachedToCar = false;
        console.log(newFoundCar.driver);
        
        api.User.getUserByIdAndUpdate(newFoundCar.driver._id, driver)
        .then(function(updatedUser){
          
          api.Car.removeCarById(req.params.id)
          .then(function(removedCar){
            res.json('done');
          })
          .catch(function(err){
            console.log(err);
            res.json('failed');
          });
        });
      });  
    } else {
      // Remove company is case no driver attached
      removeCarFromCompanyList(req.user.id, req.params.id);
      
      api.Car.removeCarById(req.params.id)
      .then(function(removedCar){
        res.json('done');
      })
      .catch(function(err){
        console.log(err);
        res.json('failed');
      });
    }
  });
});

function removeCarFromCompanyList(user_id, car_id) {
  api.User.getUserById(user_id)
  .then(function(foundUser){

    api.Company.getCompanyById(foundUser.company)
    .then(function(foundCompany){
      var carIndex = foundCompany.cars.indexOf(car_id);
      if (carIndex != -1) {
        foundCompany.cars.splice(carIndex, 1);
        foundCompany.save();
      }
    });
  });
}

module.exports = router;