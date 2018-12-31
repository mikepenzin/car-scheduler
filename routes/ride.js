var express         = require("express");
var mongoose        = require("mongoose");
var DateOnly        = require('mongoose-dateonly')(mongoose);
var userModel       = require('../models/user');
var rideModel       = require('../models/ride');
var vendorModel     = require('../models/vendor');
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

// GET - show all rides
router.get("/", middleware.isUserSteward, function(req, res){
  var vendors = [];
  
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    foundUser.company.vendors.forEach(function(vendor){
      if (vendor.currentStatus == "enabled") {
        vendors.push(vendor);
      }
    });
    
    rideModel.find({ rideEndDate: { $gte: Date.now() } }).populate('vendor').exec(function(err, foundRides){
      if (err) { console.log(err); }
      
      for ( var o = 0; o < foundRides.length; o++ ) {
          foundRides[o].rideStartDateParsed = convertDate(foundRides[o].rideStartDate, true);
          foundRides[o].rideEndDateParsed = convertDate(foundRides[o].rideEndDate, true);
      }
      
      // TODO - need to add ability to show only future rides
      
      if (foundRides) { foundRides.sort(dynamicSort('rideID')); }
      var rideID = foundRides.length > 0 ? (foundRides[foundRides.length-1].rideID + 1) : 10;
        
      res.render("rides/show", { user: foundUser, vendors:vendors, rides:foundRides, rideID : rideID });
    });
  });
});

// POST - Create ride route
router.post("/", middleware.isUserSteward, function(req, res){

  // Start Buiiding new ride object in order to add to DB
  
  var newRide = new rideModel({
      name: req.body.name,
      rideID: req.body.rideID,
      personInfo: req.body.personInfo,
      phoneNumber: req.body.phoneNumber,
      rideType: req.body.rideType,
      priceBeforeVAT: Number(req.body.priceBeforeVAT.split(',').join(''))
  });
  
  // TODO - Add ability to use vendor contact person if no one is entered.
  
  if( newRide.rideType === 'onetime' ) {
    newRide.rideStartDate = convertDate(req.body.rideStartDate[1], false);
    newRide.rideEndDate = convertDate(req.body.rideStartDate[1], false);
    newRide.startTime = req.body.startTime[1];
    newRide.endTime = req.body.endTime[1];
  } else {
    newRide.rideStartDate = convertDate(req.body.rideStartDate[0], false);
    newRide.rideEndDate = convertDate(req.body.rideEndDate, false);
    newRide.startTime = req.body.startTime[0];
    newRide.endTime = req.body.endTime[0];
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
  
  var checkAddresses = req.body.addresses.stopName;
  if (checkAddresses instanceof Array) {
    for (var i = 0; i < req.body.addresses.stopName.length; i++) {
      console.log(req.body.addresses);
      var objectToAdd = {};
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson[i];
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber[i];
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect[i]);
      
      totalNumberOfPassengers = totalNumberOfPassengers + Number(req.body.addresses.numberOfPeopleToCollect[i]);
      newRide.addresses.push(objectToAdd);
    }
    newRide.numberOfPassengers = totalNumberOfPassengers;
  } else {
    newRide.addresses = req.body.addresses;
    newRide.numberOfPassengers = Number(req.body.addresses.numberOfPeopleToCollect);
  }
  
  // Finished - Building new ride object
  
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    rideModel.create(newRide, function(err, createdRide) {
      if (err) { console.log(err); }
      
      console.log('New ride ' + createdRide.name + '(' + createdRide.rideID + ') was created');
      
      vendorModel.findById(req.body.vendor, function(err, foundVendor){
        if (err) { console.log(err); }
        
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
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    rideModel.findById(req.params.ride_id).populate('vendor').exec(function(err, foundRide){
      if (err) { console.log(err); }
      
      foundRide.rideStartDateParsed = convertDate(foundRide.rideStartDate, true);
      foundRide.rideEndDateParsed = convertDate(foundRide.rideEndDate, true);
      
      res.render("rides/update", { user: foundUser, ride:foundRide });
    });
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
      rideType: req.body.rideType
  };
  
  // TODO - Add ability to use vendor contact person if no one is entered.
  
  if( updatedRide.rideType == 'onetime' ) {
    updatedRide.rideStartDate = convertDate(req.body.rideStartDate, false);
    updatedRide.rideEndDate = convertDate(req.body.rideStartDate, false);
    updatedRide.startTime = req.body.startTime;
    updatedRide.endTime = req.body.endTime;
  } else {
    updatedRide.rideStartDate = convertDate(req.body.rideStartDate, false);
    updatedRide.rideEndDate = convertDate(req.body.rideStartDate, false);
    updatedRide.startTime = req.body.startTime;
    updatedRide.endTime = req.body.endTime;
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
  
  var checkAddresses = req.body.addresses.stopName;
  if (checkAddresses instanceof Array) {
    for (var i = 0; i < req.body.addresses.stopName.length; i++) {
      var objectToAdd = {};
      objectToAdd.stopName = req.body.addresses.stopName[i];
      objectToAdd.stopAddress = req.body.addresses.stopAddress[i];
      objectToAdd.contactPerson = req.body.addresses.contactPerson[i];
      objectToAdd.phoneNumber =  req.body.addresses.phoneNumber[i];
      objectToAdd.numberOfPeopleToCollect = Number(req.body.addresses.numberOfPeopleToCollect[i]);
      
      totalNumberOfPassengers = totalNumberOfPassengers + Number(req.body.addresses.numberOfPeopleToCollect[i]);
      updatedRide.addresses.push(objectToAdd);
    }
    updatedRide.numberOfPassengers = totalNumberOfPassengers;
  } else {
    updatedRide.addresses = req.body.addresses;
    updatedRide.numberOfPassengers = Number(req.body.addresses.numberOfPeopleToCollect);
  }
  
  // Finished - Building new ride object
  
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    rideModel.findByIdAndUpdate(req.params.ride_id, updatedRide, function(err, createdRide) {
      if (err) { console.log(err); }
      
      console.log('New ride ' + createdRide.name + '(' + createdRide.rideID + ') was created');
      
      // TODO - add delete ride from calendar and deattach car
      
      res.redirect("/company/" + foundUser.company._id + "/rides");
    });
  });
});

//DELETE - Delete car route
router.delete("/:id", middleware.isUserSteward, function(req, res){
  
  rideModel.findById(req.params.id).populate('vendor').exec(function(err, foundRide) {
    if (err) { console.log(err); }
    
    // TODO - add delete ride from calendar and deattach car
    
    vendorModel.findById(foundRide.vendor._id, function(err, foundVendor) {
      if (err) { console.log(err); }
    
      var rideIndex = foundVendor.rides.indexOf(req.params.id);
      if (rideIndex != -1) {
        foundVendor.rides.splice(rideIndex, 1);
        foundVendor.save();
      }
      
      rideModel.findByIdAndRemove(req.params.id, function(err, deletedRide) {
        if (err) {
          console.log(err);
          res.redirect("/company/" + foundVendor.company + "/rides");
        } else {
          res.redirect("/company/" + foundVendor.company + "/rides");
        }
      });
    });
  });
});

module.exports = router;