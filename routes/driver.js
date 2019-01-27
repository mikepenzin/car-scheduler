var express         = require("express");
var middleware      = require('../middleware');
var db              = require('../models');
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
    var newdate = '';
    var currentWeekDay = 0;
    
    if(!req.query.date) {
        // var dateObj = new Date();
        // var month = dateObj.getUTCMonth() + 1;
        // var day = dateObj.getUTCDate();
        // var year = dateObj.getUTCFullYear();
        
        // var newdate = day + "/" + month + "/" + year;
        // var currentWeekDay = dateObj.getDay();
        newdate = '28/12/2018';
        currentWeekDay = 5;
    } else {
        newdate = req.query.date;
        
        var dateParse = newdate.split('/');
        var month = Number(dateParse[1]) < 10 ? '0' + dateParse[1] : dateParse[1];
        var rightDate = Number(dateParse[0]) < 10 ? '0' + dateParse[0] : dateParse[0];
        newdate = rightDate + '/' + month + '/' + dateParse[2];
        
        var cd = convertDate(newdate, false);
        var dateParsed = Date.parse(cd);
        currentWeekDay = new Date(dateParsed).getDay();
    }
    
    var relevantCar = null;
    var rides = [];
    
    db.User.findById(req.user.id)
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
        
        var parsedDate = convertDate(newdate, false);
        db.Ride.find({ $and: [{ rideStartDate: { $lte: parsedDate } }, { rideEndDate: { $gte: parsedDate } }]}).populate('vendor').exec(function(err, foundRides){
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
  
  db.User.findById(req.params.id).populate('company').exec(function(err, foundDriver){
    if (err) { console.log(err); }
    
    db.Ride.findById(req.params.ride_id, function(err, foundRide){
        if (err) { console.log(err); }
        
        res.render("driver/ride-details", {user: foundDriver, ride:foundRide});   
    });
  });
});


module.exports = router;