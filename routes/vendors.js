var express         = require("express");
var companyModel    = require('../models/company');
var userModel       = require('../models/user');
var vendorModel     = require('../models/vendor');
var middleware      = require('../middleware');
var router          = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now().toLocaleString('it-IT'));
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
    }
}

//GET - General vendors route
router.get("/", middleware.isLoggedIn, function(req, res){
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'vendors',
       model: 'Vendor'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    vendorModel.find({}, function(err, foundVendors){
      foundVendors.sort(dynamicSort('vendorID'));
      
      var vendorID = foundVendors.length > 0 ? (foundVendors[foundVendors.length-1].vendorID + 1) : 10;
      res.render('vendors/show',{vendors: foundUser.company.vendors, user: foundUser, vendorID:vendorID });
    });
  });
});  

//POST - User creation route
router.post("/", middleware.isLoggedIn, function(req, res){
  var newVendor = new vendorModel({
      name: req.body.name,
      address: req.body.address,
      vendorID: req.body.vendorID,
      phoneNumber: req.body.phoneNumber
  });
  console.log("New vendor: ", newVendor);
  
  vendorModel.create(newVendor, function(err, createdVendor){
    if(err) { 
      console.log(err); 
      res.redirect("/");
    }
    
    userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
      if (err) { console.log(err); }
      
      // Need to find and update company with deleted user
      companyModel.findById(foundUser.company._id, function(err, foundCompany){
        if (err) { console.log(err); }

        foundCompany.vendors.push(createdVendor);
        foundCompany.save();
        createdVendor.company = foundCompany._id;
        createdVendor.save();
        
        console.log("### Added new user #####", newVendor);
        res.redirect("/company/" + foundCompany._id + "/vendors");
      });
    });
  });  
});

//GET - User card show route
router.get("/:id", middleware.isLoggedIn, function(req, res){
  userModel.findById(req.params.id, function(err, foundUser){
    if (err) { console.log(err); }
      
    userModel.findById(req.user.id).populate('company').exec(function(err, currentUser){
      if (err) { console.log(err); }
      
      res.render('users/profile',{user:currentUser, driver: foundUser});
    });
  });
});

//GET - User update show route
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
  
  vendorModel.findById(req.params.id, function(err, foundVendor){
    if (err) { console.log(err); }
      
    userModel.findById(req.user.id).populate('company').exec(function(err, currentUser){
      if (err) { console.log(err); }
      
      res.render('vendors/update',{user:currentUser, vendor:foundVendor});
    });
  });
});

//PUT - User update route
router.put("/:id/edit", middleware.isLoggedIn, function(req, res){
  var updatedVendor = {
      name: req.body.name,
      personInfo:  req.body.personInfo,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber
  };
  
  vendorModel.findByIdAndUpdate(req.params.id, updatedVendor, function(err, foundVendor){
    if (err) { console.log(err); }
      
    userModel.findById(req.user.id).populate('company').exec(function(err, currentUser){
      if (err) { console.log(err); }
      
      res.render('vendors/update',{user:currentUser, vendor: foundVendor});
    });
  });
});


//GET - Vendor route to update status 
router.get("/:id/change-status", function(req, res){
    
    vendorModel.findById(req.params.id, function(err, vendor){
      if (err) {
        console.log(err);
      }
      
      console.log(vendor);
      
      vendor.currentStatus = vendor.currentStatus == 'enabled' ? vendor.currentStatus = 'disabled' : vendor.currentStatus = 'enabled';
      vendor.save();
      
      res.redirect("/company/" + vendor.company._id + "/vendors");
    });
    
});

//DELETE - User route to delete item 
router.delete("/:id", middleware.isLoggedIn, function(req, res){
  
  userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    // Need to find and update company with deleted vendor
    companyModel.findById(foundUser.company._id, function(err, foundCompany){
      if (err) { console.log(err); }

      var foundUserIndex = foundCompany.vendors.indexOf(req.params.id);
      if (foundUserIndex != -1) {
        foundCompany.vendors.splice(foundUserIndex, 1);
        foundCompany.save();
      }
      
      // After company was updated we will remove selected vendor
      vendorModel.findByIdAndRemove(req.params.id, function(err, vendor){
        if (err) {
          console.log(err);
          res.redirect("/company/" + foundCompany._id + "/vendors");
        } else {
          res.redirect("/company/" + foundCompany._id + "/vendors");
        }        
      });
    });
  });
});

module.exports = router;