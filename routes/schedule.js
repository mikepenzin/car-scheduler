var express     = require("express");
var userModel   = require('../models/user');
var rideModel   = require('../models/ride');
var vendorModel = require('../models/vendor');
var carModel    = require('../models/car');
var middleware  = require('../middleware');
var router      = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});

function convertDate(date, backward) {
  if (!backward) {

    var newDate = date.split('/');
    return newDate[1] + '/' + newDate[0] + '/' + newDate[2];

  } else {

    var month = (date.month + 1) < 10 ? '0'+(date.month + 1) : (date.month + 1);
    var rightDate = date.date < 10 ? '0' + date.date : date.date;
    
    return rightDate + '/' + month + '/' + date.year; 

  }
}

//GET - Schedule today route
router.get("/", middleware.isUserSteward, function(req, res){
    // var dateObj = new Date();
    // var month = dateObj.getUTCMonth() + 1;
    // var day = dateObj.getUTCDate();
    // var year = dateObj.getUTCFullYear();
    
    // var newdate = day + "/" + month + "/" + year;
    // var currentWeekDay = dateObj.getDay();
    
    var newdate = '28/12/2018';
    var currentWeekDay = 5;
    
    var rides = [];
    userModel.findById(req.user.id)
      .populate({ 
         path: 'company',
         populate: {
           path: 'vendors',
           model: 'Vendor'
         }
      }).exec(function(err, foundUser){
        if (err) { console.log(err); }
        
        rideModel.find({ $and: [{ rideStartDate: { $lte: Date.now() } }, { rideEndDate: { $gte: Date.now() } }]}).populate('vendor').exec(function(err, foundRides){
            if (err) { console.log(err); }
            
            for (var i = 0; i < foundRides.length; i++) {
                if(foundRides[i].rideType == 'onetime') {
                    if(newdate == convertDate(foundRides[i].rideStartDate, true))
                    rides.push(foundRides[i]);
                } else {
                    if (foundRides[i].weekDays.indexOf(currentWeekDay) != -1) {
                        rides.push(foundRides[i]);    
                    }
                }
            }
            
            carModel.find({}, function(err, foundCars){
                if (err) { console.log(err); }
                
                res.render("schedule/show", {user:foundUser, today: newdate, rides: foundRides, cars:foundCars});
            });
        });
      });
});


router.get("/updateCars", function(req, res){
    var objJson = {};
    
    rideModel.findById(req.query.ride_id ,function(err, foundRide){
        if (err) { console.log(err); }
        
        carModel.find(req.query.car_id, function(err, foundCar){
            if (err) { console.log(err); }
            
            for (var i = 0; i < foundRide.addresses.length; i++) {

                if (foundRide.addresses[i].stopName == req.query.stopName) {
                    if (foundCar.numberOfSeats <= foundRide.addresses[i].numberOfPeopleToCollect) {
                        objJson.remainPassengers = foundRide.addresses[i].stopName - foundCar.numberOfSeats;
                    }   
                }
                
            }
            
            console.log(objJson);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(objJson, null, 3));
        });
    });
});


module.exports = router;