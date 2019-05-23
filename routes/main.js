var express         = require("express");
var middleware      = require('../middleware');
var api             = require("../services/api");
var router          = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});


//root route
router.get("/", middleware.isLoggedInMainPage , function(req, res){
  
  api.User.getUserByIdAndPopulate(req.user.id, { path: 'company', populate: { path: 'vendors', model: 'Vendor' } })  
  .then(function(foundUser){
    if( foundUser.role == 'steward' || foundUser.role == 'admin' ) {
      
      var driversCounter = 0;
      var carsCounter = 0;
      var contractorCarsCounter = 0;
      var totalRides = 0;
      
      for (var t = 0; t < foundUser.company.vendors.length; t++ ) {
        totalRides += foundUser.company.vendors[t].rides.length;
      }
      
      api.User.getQuery({company: foundUser.company._id})
      .then(function(relevantUsers){
        for(var i = 0; i < relevantUsers.length; i++) {
          if(relevantUsers[i].role == 'driver') {
            driversCounter++;
          }
        }
        
        api.Company.getCompanyByIdAndPopulate(foundUser.company._id, 'cars')  
        .then(function(foundCompany){
          
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
        })
        .catch(function(err){
          console.log(err);
          res.redirect("back");
        });
      })
      .catch(function(err){
        console.log(err);
        res.redirect("back");
      });
      
    } else {
      res.redirect('/company/'+ foundUser.company._id +'/driver/' + foundUser._id);
    }

    
  })
  .catch(function(err){
    console.log(err);
    res.redirect("back");
  });
});

//GET - 404 page route
router.get("/404", function(req, res){
  res.render("main/404");
});


module.exports = router;