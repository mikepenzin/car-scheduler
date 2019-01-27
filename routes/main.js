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


//root route
router.get("/", middleware.isLoggedIn , function(req, res){
  
  db.User.findById(req.user.id).populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    if( foundUser.role == 'steward' || foundUser.role == 'admin' ) {
      
      var driversCounter = 0;
      var carsCounter = 0;
      var contractorCarsCounter = 0;
      var totalRides = 0;
      
      for (var t = 0; t < foundUser.company.vendors.length; t++ ) {
        totalRides += foundUser.company.vendors[t].rides.length;
      }
      
      db.User.find({company: foundUser.company._id}, function(err, relevantUsers){
        if (err) { console.log(err); }
        
        for(var i = 0; i < relevantUsers.length; i++) {
          if(relevantUsers[i].role == 'driver') {
            driversCounter++;
          }
        }
        
        db.Company.findById(foundUser.company._id).populate('cars').exec(function(err, foundCompany){
          if (err) { console.log(err); }
          
          for(var y = 0; y < foundCompany.cars.length; y++) {
            if(foundCompany.cars[y].isContractor) {
              contractorCarsCounter++;
            } else {
              carsCounter++;
            }
          }
          
          res.render("main/main", {user: foundUser, 
                                   driversCounter: driversCounter, 
                                   totalAmountOFUsers: relevantUsers.length, 
                                   carsCounter: carsCounter, 
                                   contractorCarsCounter:contractorCarsCounter, 
                                   totalRides:totalRides});
        });
      });
      
    } else {
      res.redirect('/company/'+ foundUser.company._id +'/driver/' + foundUser._id);
    }

    
  });
});

//GET - 404 page route
router.get("/404", function(req, res){
      res.render("main/404");
});


module.exports = router;