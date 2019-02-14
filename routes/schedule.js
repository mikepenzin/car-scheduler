var express     = require("express");
var api         = require("../service_api");
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

function converTimeToString(time) {
  var timeString;
  if (time < 60 && time >= 10) {
      timeString = "00" + time;
  } else if(time < 10) {
      timeString = "000" + time;
  } else if (time.toString().length < 4) {
      timeString = "0" + time;
  } else {
      timeString = time.toString();
  }
  
  timeString = [timeString.slice(0, 2), ':', timeString.slice(2)].join('');
  return timeString;
}

//GET - Schedule today route
router.get("/", middleware.isUserSteward, function(req, res){
    var newdate = '';
    var currentWeekDay = 0;
    var month;
    
    if(!req.query.date) {
        var dateObj = new Date();
        month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        
        newdate = day + "/" + month + "/" + year;
        currentWeekDay = dateObj.getDay();
        // newdate = '28/12/2018';
        // currentWeekDay = 5;
    } else {
        newdate = req.query.date;
        
        var dateParse = newdate.split('/');
        month = Number(dateParse[1]) < 10 ? '0' + dateParse[1] : dateParse[1];
        var rightDate = Number(dateParse[0]) < 10 ? '0' + dateParse[0] : dateParse[0];
        newdate = rightDate + '/' + month + '/' + dateParse[2];
        
        var cd = convertDate(newdate, false);
        var dateParsed = Date.parse(cd);
        currentWeekDay = new Date(dateParsed).getDay();
    }
    
    var rides = [];
    
    api.User.getUserByIdAndPopulate(req.user.id,'company')
    .then(function(foundUser){
        
        api.Ride.getRidesBetweeenDates(convertDate(newdate, false), convertDate(newdate, false), currentWeekDay, foundUser.company.vendors)
        .then(function(foundRides){
            for (var i = 0; i < foundRides.length; i++) {
                
                if(foundRides[i].rideType == 'onetime') {
                    if(newdate == convertDate(foundRides[i].rideStartDate, true)) {
                        foundRides[i].startTimeParsed = converTimeToString(foundRides[i].startTime);
                        foundRides[i].endTimeParsed = converTimeToString(foundRides[i].endTime);
                        rides.push(foundRides[i]);
                    }
                } else {
                    if (foundRides[i].weekDays.indexOf(currentWeekDay) != -1) {
                        foundRides[i].startTimeParsed = converTimeToString(foundRides[i].startTime);
                        foundRides[i].endTimeParsed = converTimeToString(foundRides[i].endTime);
                        rides.push(foundRides[i]);    
                    }
                }
            }
            
            api.Car.getAllCars().then(function(foundCars){
                res.render("schedule/show", {user:foundUser, currentDay: newdate, rides: rides, cars:foundCars});
            });
        });
      })
      .catch(function(err){
        console.log(err);
      });
});

router.get("/updateCars", function(req, res){
    var objJson = {};
    
    api.Ride.getRideById(req.query.ride_id).then(function(foundRide) { 
        api.Car.getCarById(req.query.car_id).then(function(foundCar) {
            for (var i = 0; i < foundRide.addresses.length; i++) {
                console.log(foundRide.addresses[i].stopName, req.query.stopName, foundCar.numberOfSeats, foundRide.addresses[i].numberOfPeopleToCollect);
                
                if (foundRide.addresses[i].stopName == req.query.stopName) {
                    if (foundCar.numberOfSeats <= foundRide.addresses[i].numberOfPeopleToCollect) {
                        objJson.remainPassengers = foundRide.addresses[i].numberOfPeopleToCollect - foundCar.numberOfSeats;
                    }   
                }
            }
            console.log(objJson);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(objJson, null, 3));
        });
    })
    .catch(function(err){
        console.log(err);
    });
});


module.exports = router;