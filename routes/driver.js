var express = require("express");
var middleware = require('../middleware');
var api = require("../services/api");
var converter = require("../services/helpers/converters");
var router = express.Router();


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    let d = new Date();
    let n = d.toLocaleString('it-IT');
    console.log('Time: ', n);
    next();
});

//GET - Driver info route
router.get('/:id', middleware.isUserDriver, function(req, res) {
    var newdate = '';
    var currentWeekDay = 0;
    var month;

    if (!req.query.date) {
        var dateObj = new Date();
        month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        newdate = day + "/" + month + "/" + year;
        currentWeekDay = dateObj.getDay();
        // newdate = '28/12/2018';
        // currentWeekDay = 5;
    }
    else {
        newdate = req.query.date;

        var dateParse = newdate.split('/');
        month = Number(dateParse[1]) < 10 ? '0' + dateParse[1] : dateParse[1];
        var rightDate = Number(dateParse[0]) < 10 ? '0' + dateParse[0] : dateParse[0];
        newdate = rightDate + '/' + month + '/' + dateParse[2];

        var cd = converter.convertDate(newdate, false);
        var dateParsed = Date.parse(cd);
        currentWeekDay = new Date(dateParsed).getDay();
    }

    var relevantCar = null;
    var rides = [];

    api.User.getUserByIdAndPopulate(req.user.id, { path: 'company', populate: { path: 'cars', model: 'Car' } })
        .then(function(foundDriver) {

            for (var i = 0; i < foundDriver.company.cars.length; i++) {
                if (foundDriver.company.cars[i].driver && foundDriver.company.cars[i].driver.equals(foundDriver._id)) {
                    relevantCar = foundDriver.company.cars[i];
                }
            }

            var parsedDate = converter.convertDate(newdate, false);

            api.Ride.getRidesBetweeenDatesAndPopulate(parsedDate, parsedDate, foundDriver.company.vendors, 'vendor')
                .then(function(foundRides) {

                    for (var i = 0; i < foundRides.length; i++) {
                        if (foundRides[i].rideType == 'onetime') {
                            if (newdate == converter.convertDate(foundRides[i].rideStartDate, true))
                                rides.push(foundRides[i]);
                        }
                        else {
                            if (foundRides[i].weekDays.indexOf(currentWeekDay) != -1) {
                                rides.push(foundRides[i]);
                            }
                        }
                    }

                    console.log(relevantCar, rides);
                    res.render("driver/main", { user: foundDriver, relevantCar: relevantCar, rides: rides, currentDay: newdate });
                })
                .catch(function(err) {
                    console.log(err);
                    res.redirect("back");
                });
        })
        .catch(function(err) {
            console.log(err);
            res.redirect("back");
        });
});

//GET - Driver ride info route
router.get('/:id/ride/:ride_id', middleware.isUserDriver, function(req, res) {

    api.User.getUserByIdAndPopulate(req.params.id, 'company')
        .then(function(foundDriver) {
            api.Ride.getRideById(req.params.ride_id)
                .then(function(foundRide) {
                    res.render("driver/ride-details", { user: foundDriver, ride: foundRide });
                })
                .catch(function(err) {
                    console.log(err);
                    res.redirect("back");
                });
        })
        .catch(function(err) {
            console.log(err);
            res.redirect("back");
        });

});


module.exports = router;
