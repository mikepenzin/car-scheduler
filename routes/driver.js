var express         = require("express");
var middleware      = require('../middleware');
var companyModel    = require('../models/company');
var carModel        = require('../models/car');
var userModel       = require('../models/user');
var rideModel       = require('../models/ride');
var router          = express.Router();


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

//GET - Driver info route
router.get('/:id', middleware.isUserDriver, function(req, res){
    
    var relevantCar = null;
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
            path: 'cars',
            model: 'Car'
        }
    }).exec(function(err, foundDriver){
        if (err) { console.log(err); }
        
        for (var i = 0; i < foundDriver.company.cars.length; i++) {
         
            if (foundDriver.company.cars[i].driver && foundDriver.company.cars[i].driver.equals(foundDriver._id)) {
                relevantCar = foundDriver.company.cars[i];
            }
            
        }
        
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
            
            console.log(relevantCar, rides);
            res.render("driver/main", {user: foundDriver, relevantCar:relevantCar, rides:rides, currentDay: newdate}); 
        });
    });
});

//GET - Driver ride info route
router.get('/:id/ride/:ride_id', middleware.isUserDriver, function(req, res){
  
  userModel.findById(req.query.id).populate().exec(function(err, foundDriver){
    if (err) { console.log(err); }
    
    res.render("driver/ride-details", {user: foundDriver});
  });
  
});


module.exports = router;