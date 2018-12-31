var express         = require("express");
var companyModel    = require('../models/company');
var userModel       = require('../models/user');
var cloudinary      = require("cloudinary");
var multipart       = require("connect-multiparty");
var router          = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});

var multipartMiddleware = multipart();

//root admin route
router.get("/", function(req, res){
    res.render("admin/dashboard");
});

//GET - Companies route
router.get("/company", function(req, res){
    companyModel.find({}, function(err, foundCompanies){
      if (err) {
        console.log(err);
      }
      
      res.render("admin/companies/show", { companies: foundCompanies });
    });
});

//POST - New company route
router.post("/company", function(req, res){
    var newCompany = {};
    newCompany.name = req.body.companyName;
    newCompany.companyID = req.body.companyID;
    newCompany.address = req.body.companyAddress;
    newCompany.city = req.body.city;
    newCompany.contactPerson = req.body.contactPerson;
    newCompany.phoneNumber1 = req.body.phoneNumber1;
    newCompany.phoneNumber2 = req.body.phoneNumber2;
  
    companyModel.create(newCompany, function(err, company){
      if (err) {
        console.log(err);
      }
      console.log("### Added new company #####", newCompany);
      res.redirect("/admin/company");
    });
    
});

//GET - One company route
router.get("/company/:id/edit", function(req, res){
    companyModel.findById(req.params.id, function(err, company){
      if (err) {
        console.log(err);
      }
      console.log(company);
      res.render("admin/companies/update", {company: company});
    });
});

//PUT - One company data update
router.put("/company/:id/edit", function(req, res){
    var companyUpdate = {};
    companyUpdate.name = req.body.companyName;
    companyUpdate.address = req.body.companyAddress;
    companyUpdate.city = req.body.city;
    companyUpdate.contactPerson = req.body.contactPerson;
    companyUpdate.phoneNumber1 = req.body.phoneNumber1;
    companyUpdate.phoneNumber2 = req.body.phoneNumber2;

    companyModel.findByIdAndUpdate(req.params.id, companyUpdate, function(err, updatedComapny){
      if(err){
        console.log(err);
        res.redirect("back");
      } else {
        res.redirect("/admin/company/");
      }
    });
});

//POST - Upload company image
router.post("/company/:id/update-photo", multipartMiddleware, function(req, res, next){
		cloudinary.v2.uploader.upload(req.files.companyLogo.path, function(error, result) {
		    if (error) { console.log(error); }
      
        companyModel.findByIdAndUpdate(req.params.id, {companyLogo: result}, function(err, updatedComapny){
          if(err){ console.log(err); } 
          res.redirect("/admin/company/" + req.params.id + "/edit");
        });
    });
});


//PUT - Company route to update status 
router.get("/company/:id/change-status", function(req, res){
    
    companyModel.findById(req.params.id, function(err, company){
      if (err) {
        console.log(err);
      }
      company.active = !company.active;
      company.save();
      
      console.log("### Added new company #####");
      res.redirect("/admin/company");
    });
    
});

//DELETE - Company route to delete item 
router.delete("/company/:id", function(req, res){
  
  // Remove company
  companyModel.findByIdAndRemove(req.params.id, function(err, company){
    if (err) {
       console.log(err);
       res.redirect("/admin/company");
    } else {
       res.redirect("/admin/company");
    }        
  });
  
});


//GET - User route
router.get("/user", function(req, res){
  
  companyModel.find({}, function(err, foundCompanies){
    if(err) { console.log(err) }
    userModel.find({}).populate('company').exec(function(err, foundUsers){
      if(err) { console.log(err) }
      
      res.render("admin/users/show", {companies:foundCompanies, users:foundUsers});
    });
  });
    
});

//POST - User route
router.post("/user", function(req, res){
    var newUser = new userModel({
        username: req.body.username,
        firstName: req.body.firstName,
        personalID: req.body.personalID,
        lastName:  req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        role: req.body.role
    });
    
    console.log("New user: ", newUser);
    
    userModel.register(newUser, req.body.password, function(err, createdUser){
        if(err){
            console.log(err);
        } else {
            createdUser.company = req.body.company;
            createdUser.save();
            companyModel.findById(req.body.company, function(err, foundCompany){
              if (err) { console.log(err); }
              foundCompany.users.push(createdUser);
              foundCompany.save();
            });
            console.log("### Added new user #####", newUser);
            res.redirect("/admin/user");
        }
    });
    
});

//GET - One user profile route
router.get("/user/:id/edit", function(req, res){
  companyModel.find({}, function(err, foundCompanies){
    if(err) { console.log(err) }
    userModel.findById(req.params.id).populate('company').exec(function(err, foundUser){
      if (err) {
        console.log(err);
      }
      console.log(foundUser);
      res.render("admin/users/update", {user: foundUser, companies:foundCompanies});
    });
  });  
});

//PUT - One user data update
router.put("/user/:id/edit", function(req, res){
    var newUser = {
        firstName: req.body.firstName,
        lastName:  req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        role: req.body.role
    };

    userModel.findByIdAndUpdate(req.params.id, newUser, function(err, updatedUser){
      if(err){
        console.log(err);
        res.redirect("back");
      } else {
        updatedUser.company = req.body.company;
        updatedUser.save();
        companyModel.findById(req.body.company, function(err, foundCompany){
          if (err) { console.log(err); }
          
          console.log(foundCompany.users.indexOf(updatedUser._id));
          if (foundCompany.users.indexOf(updatedUser._id) == -1) {
            foundCompany.users.push(updatedUser);
            foundCompany.save();
          }
          
          res.redirect("/admin/user/");
        });
      }
    });
});

//POST - Upload user image
router.post("/user/:id/update-photo", function(req, res, next){

		cloudinary.v2.uploader.upload(req.files.userPic.path, function(error, result) {
		    if (error) { console.log(error); }
      
        userModel.findByIdAndUpdate(req.params.id, {userPic: result}, function(err, updatedUser){
          if(err){ console.log(err); } 
          res.redirect("/admin/user/" + req.params.id + "/edit");
        });
    });

});

//DELETE - Company route to delete item 
router.delete("/user/:id", function(req, res){
  
  // Remove company
  userModel.findByIdAndRemove(req.params.id, function(err, user){
    if (err) {
       console.log(err);
       res.redirect("/admin/user");
    } else {
       res.redirect("/admin/user");
    }        
  });
  
});

module.exports = router;