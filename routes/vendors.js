var express = require("express");
// var db              = require('../models');
var api = require("../services/api");
var middleware = require('../middleware');
var router = express.Router();


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});

//GET - General vendors route
router.get("/", middleware.isUserSteward, function(req, res) {

  api.User.getUserByIdAndPopulate(req.user.id, { path: 'company', populate: { path: 'vendors', model: 'Vendor' } })
    .then(function(foundUser) {
      res.render('vendors/show', { vendors: foundUser.company.vendors, user: foundUser });
    })
    .catch(function(err) {
      console.log(err);
      res.redirect('back');
    });
});

//GET - Get all vendors JSON
router.get("/getAllVendors", middleware.isUserSteward, function(req, res) {

  api.User.getUserByIdAndPopulate(req.user.id, { path: 'company', populate: { path: 'vendors', model: 'Vendor' } })
    .then(function(foundUser) {
      res.json(foundUser.company.vendors);
    })
    .catch(function(err) {
      console.log(err);
      res.json('error');
    });
});

//POST - User creation route
router.post("/", middleware.isUserSteward, function(req, res) {
  var newVendor = {
    name: req.body.name,
    address: req.body.address,
    personInfo: req.body.personInfo,
    phoneNumber: req.body.phoneNumber
  };
  console.log("New vendor: ", newVendor);

  api.Vendor.createVendor(newVendor)
    .then(function(createdVendor) {

      api.Company.getCompanyByUserId([req.user.id])
        .then(function(foundCompany) {
          foundCompany[0].vendors.push(createdVendor);
          foundCompany[0].save();
          createdVendor.company = foundCompany[0]._id;
          createdVendor.save();

          console.log("### Added new user #####", newVendor);
          res.json(createdVendor);

        })
        .catch(function(err) {
          console.log(err);
          res.json('error');
        });
    })
    .catch(function(err) {
      console.log(err);
      res.json('error');
    });
});

//GET - User update show route
router.get("/:id/edit", middleware.isUserSteward, function(req, res) {

  api.Vendor.getVendorById(req.params.id)
    .then(function(foundVendor) {
      api.User.getUserByIdAndPopulate(req.user.id, 'company')
        .then(function(currentUser) {
          res.render('vendors/update', { user: currentUser, vendor: foundVendor });
        })
        .catch(function(err) {
          console.log(err);
          res.redirect('back');
        });
    })
    .catch(function(err) {
      console.log(err);
      res.redirect('back');
    });
});

//PUT - User update route
router.put("/:id/edit", middleware.isUserSteward, function(req, res) {
  var updatedVendor = {
    name: req.body.name,
    personInfo: req.body.personInfo,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber
  };

  api.Vendor.getVendorByIdAndUpdate(req.params.id, updatedVendor)
    .then(function(foundVendor) {

      api.Company.getCompanyByUserId([req.user.id])
        .then(function(foundCompanies) {
          res.redirect("/company/" + foundCompanies[0]._id + "/vendors");
        })
        .catch(function(err) {
          console.log(err);
          res.redirect('back');
        });
    })
    .catch(function(err) {
      console.log(err);
      res.redirect('back');
    });
});

//GET - Vendor route to update status 
router.put("/:id/change-status", function(req, res) {

  var isActive = { isActive: req.body.isActive === 'true' };
  console.log(req.params.id, isActive);

  api.Vendor.getVendorByIdAndUpdate(req.params.id, isActive)
    .then(function(vendor) {

      res.json(isActive);
    })
    .catch(function(err) {
      console.log(err);
    });
});

//DELETE - User route to delete item 
// router.delete("/:id", middleware.isUserSteward, function(req, res){

//   api.Company.getCompanyByUserId([req.user.id])
//   .then(function(foundCompany){
//       var foundUserIndex = foundCompany[0].vendors.indexOf(req.params.id);
//       if (foundUserIndex != -1) {
//         foundCompany[0].vendors.splice(foundUserIndex, 1);
//         foundCompany[0].save();
//       }

//       // After company was updated we will remove selected vendor
//       db.Vendor.findByIdAndRemove(req.params.id, function(err, vendor){
//         if (err) {
//           console.log(err);
//           res.redirect("/company/" + foundCompany._id + "/vendors");
//         } else {
//           res.redirect("/company/" + foundCompany._id + "/vendors");
//         }        
//       });
//   });
// });

module.exports = router;
