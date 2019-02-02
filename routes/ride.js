var express         = require("express");
var api             = require("../service_api");
var middleware      = require('../middleware');
var router          = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
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

// GET - show all rides
router.get("/", middleware.isUserSteward, function(req, res){
  var vendors = [];
  
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'vendors', model: 'Vendor'}})
  .then(function(foundUser){
    foundUser.company.vendors.forEach(function(vendor){
      if (vendor.currentStatus == "enabled") {
        vendors.push(vendor);
      }
    });
    
    // rideEndDate: { $gte: Date.now() } 
    api.Ride.getAllRidesAndPopulate(vendors, 'vendor').sort({rideID: 1})
    .then(function(foundRides){
      
      for ( var o = 0; o < foundRides.length; o++ ) {
          foundRides[o].rideStartDateParsed = convertDate(foundRides[o].rideStartDate, true);
          foundRides[o].rideEndDateParsed = convertDate(foundRides[o].rideEndDate, true);
          foundRides[o].startTimeParsed = converTimeToString(foundRides[o].startTime);
          foundRides[o].endTimeParsed = converTimeToString(foundRides[o].endTime);
      }
  
      // TODO - need to add ability to show only future rides
      var rideID = foundRides.length > 0 ? (foundRides[foundRides.length-1].rideID + 1) : 10;
      
      console.log("IT!!!!!!!!!!!!!!!  ", foundRides);
      res.render("rides/show", { user: foundUser, vendors:vendors, rides:foundRides.sort(dynamicSort('-rideID')), rideID : rideID });
    })
    .catch(function(err){
      console.log(err);
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

// POST - Create ride route
router.post("/", middleware.isUserSteward, function(req, res){

  // Start Buiiding new ride object in order to add to DB
  var newRide = {
    name: req.body.name,
    rideID: req.body.rideID,
    personInfo: req.body.personInfo,
    phoneNumber: req.body.phoneNumber,
    rideType: req.body.rideType,
    priceBeforeVAT: Number(req.body.priceBeforeVAT.split(',').join('')),
    notes: req.body.notes ? req.body.notes.replace(/(?:\r\n|\r|\n)/g, '\n') : undefined,
    addresses: []
  };
  
  // TODO - Add ability to use vendor contact person if no one is entered.
  
  if( newRide.rideType === 'onetime' ) {
    newRide.rideStartDate = convertDate(req.body.rideStartDate[1], false);
    newRide.rideEndDate = convertDate(req.body.rideStartDate[1], false);
    newRide.startTime = Number(req.body.startTime[1].replace(':', ''));
    newRide.endTime = Number(req.body.endTime[1].replace(':', ''));
  } else {
    newRide.rideStartDate = convertDate(req.body.rideStartDate[0], false);
    newRide.rideEndDate = convertDate(req.body.rideEndDate, false);
    newRide.startTime = Number(req.body.startTime[0].replace(':', ''));
    newRide.endTime = Number(req.body.endTime[0].replace(':', ''));
    var dayOfWeek = req.body.dayOfWeek.map(item => (Array.isArray(item) && item[1]) || null);
    var weekDays = [];
    
    for ( var p = 0; p < dayOfWeek.length; p++ ) {
      if ( dayOfWeek[p] ) {
        weekDays.push(p);
      }
    }
    newRide.weekDays = weekDays;
  }
  
  var totalNumberOfPassengers = 0;
  
  // TODO - Add ability to use ride contact person if no one is entered.
  
  var checkAddresses = req.body.addresses.stopName.length;
  
  for (var i = 0; i < checkAddresses-1; i++) {
    var objectToAdd = {};
    if(checkAddresses == 2 && i == 0) {
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson;
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber;
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect);
    } else {
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson[i];
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber[i];
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect[i]);
    }  
  
    totalNumberOfPassengers = totalNumberOfPassengers + objectToAdd.numberOfPeopleToCollect;
    newRide.addresses.push(objectToAdd);
  }
  
  var lastAddressObject = {};
  lastAddressObject.stopName = req.body.addresses.stopName[req.body.addresses.stopName.length-1];
  lastAddressObject.stopAddress = req.body.addresses.stopAddress[req.body.addresses.stopName.length-1];
  lastAddressObject.contactPerson = req.body.personInfo;
  lastAddressObject.phoneNumber =  req.body.phoneNumber;
  lastAddressObject.numberOfPeopleToCollect = 0;
  
  newRide.addresses.push(lastAddressObject);
  
  newRide.numberOfPassengers = totalNumberOfPassengers;
  
  // Finished - Building new ride object
  
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'vendors',model: 'Vendor'}})
  .then(function(foundUser){
    
    api.Ride.createNewRide(newRide)
    .then(function(createdRide){
      
      console.log('New ride ' + createdRide.name + ' - ' + createdRide.rideID + ' was created');
      
      api.Vendor.getVendorById(req.body.vendor)  
      .then(function(foundVendor){
        
        createdRide.vendor = foundVendor;
        createdRide.save();
        
        foundVendor.rides.push(createdRide);
        foundVendor.save();
        
        // TODO - Needto add form validation before submit
        
        res.redirect("/company/" + foundUser.company._id + "/rides");
      });
    });
  });
});

// GET - Show specific ride route
router.get("/:ride_id", middleware.isUserSteward, function(req, res){
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'vendors', model: 'Vendor'}})
  .then(function(foundUser){  
    
    api.Ride.getRideByIdAndPopulate(req.params.ride_id, 'vendor')
    .then(function(foundRide){
    
      foundRide.rideStartDateParsed = convertDate(foundRide.rideStartDate, true);
      foundRide.rideEndDateParsed = convertDate(foundRide.rideEndDate, true);
      foundRide.startTimeParsed = converTimeToString(foundRide.startTime);
      foundRide.endTimeParsed = converTimeToString(foundRide.endTime);
      
      res.render("rides/update", { user: foundUser, ride:foundRide });
    })
    .catch(function(err){
      console.log(err);
      res.redirect('back');
    });
  })
  .catch(function(err){
    console.log(err);
    res.redirect('back');
  });  
});

// PUT - ride update route
router.put("/:ride_id", middleware.isUserSteward, function(req, res){
  
  // Start Buiiding new ride object in order to add to DB
  var updatedRide = {
      name: req.body.name,
      personInfo: req.body.personInfo,
      phoneNumber: req.body.phoneNumber,
      priceBeforeVAT: Number(req.body.priceBeforeVAT.split(',').join('')),
      rideType: req.body.rideType,
      notes: req.body.notes ? req.body.notes.replace(/(?:\r\n|\r|\n)/g, '\n') : undefined,
      addresses: []
  };
  
  // TODO - Add ability to use vendor contact person if no one is entered.
  updatedRide.startTime = Number(req.body.startTime.replace(':', ''));
  updatedRide.endTime = Number(req.body.endTime.replace(':', ''));
    
  if( updatedRide.rideType === 'onetime' ) {
    updatedRide.rideStartDate = convertDate(req.body.rideStartDate, false);
    updatedRide.rideEndDate = convertDate(req.body.rideStartDate, false);
  } else {
    updatedRide.rideStartDate = convertDate(req.body.rideStartDate, false);
    updatedRide.rideEndDate = convertDate(req.body.rideEndDate, false);
    var dayOfWeek = req.body.dayOfWeek.map(item => (Array.isArray(item) && item[1]) || null);
    var weekDays = [];
    
    for ( var p = 0; p < dayOfWeek.length; p++ ) {
      if ( dayOfWeek[p] ) {
        weekDays.push(p);
      }
    }
    updatedRide.weekDays = weekDays;
  }
  
  var totalNumberOfPassengers = 0;
  updatedRide.addresses = [];
  
  // TODO - Add ability to use ride contact person if no one is entered.
  
  var checkAddresses = req.body.addresses.stopName.length;
    
  for (var i = 0; i < checkAddresses-1; i++) {
    var objectToAdd = {};
    if(checkAddresses == 2 && i == 0) {
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson;
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber;
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect);
    } else {
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson[i];
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber[i];
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect[i]);
    }
    
    totalNumberOfPassengers = totalNumberOfPassengers + objectToAdd.numberOfPeopleToCollect;
    updatedRide.addresses.push(objectToAdd);
  }
  
  var lastAddressObject = {};
  lastAddressObject.stopName = req.body.addresses.stopName[req.body.addresses.stopName.length-1];
  lastAddressObject.stopAddress = req.body.addresses.stopAddress[req.body.addresses.stopName.length-1];
  lastAddressObject.contactPerson = req.body.personInfo;
  lastAddressObject.phoneNumber =  req.body.phoneNumber;
  lastAddressObject.numberOfPeopleToCollect = 0;
  
  updatedRide.addresses.push(lastAddressObject);
  updatedRide.numberOfPassengers = totalNumberOfPassengers;

  
  // Finished - Building new ride object
  
  api.User.getUserByIdAndPopulate(req.user.id, {path: 'company',populate: {path: 'vendors', model: 'Vendor'}})
  .then(function(foundUser){  
    
    api.Ride.updateRidebyId(req.params.ride_id, updatedRide)
    .then(function(createdRide){
      
      console.log('Ride ' + createdRide.name + ' - ' + createdRide.rideID + ' was updated');
      
      // TODO - add delete ride from calendar and deattach car
      res.redirect("/company/" + foundUser.company._id + "/rides");
    });
  });
});

//DELETE - Delete car route
router.delete("/:id", middleware.isUserSteward, function(req, res){

  api.Ride.getRideByIdAndPopulate(req.params.id, 'vendor')
  .then(function(foundRide){  
    // TODO - add delete ride from calendar and deattach car
    
    api.Vendor.getVendorById(foundRide.vendor._id)
    .then(function(foundVendor){
      var rideIndex = foundVendor.rides.indexOf(req.params.id);
      if (rideIndex != -1) {
        foundVendor.rides.splice(rideIndex, 1);
        foundVendor.save();
      }
      
      api.Ride.removeRidebyId(req.params.id)
      .then(function(deletedRide){
        res.redirect("/company/" + foundVendor.company + "/rides");
      })
      .catch(function(err){
        console.log(err);
        res.redirect("/company/" + foundVendor.company + "/rides");
      });
    })
    .catch(function(err){
      console.log(err);
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

module.exports = router;