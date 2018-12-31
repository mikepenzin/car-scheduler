var express         = require("express");
var companyModel    = require('../models/company');
var userModel       = require('../models/user');
var middleware      = require('../middleware');
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

//GET - General users route
router.get("/", middleware.isUserSteward, function(req, res){
  userModel.findById(req.user.id)
  .populate({ 
     path: 'company',
     populate: {
       path: 'users',
       model: 'User'
     }
  }).exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    userModel.find({}).populate('company').exec(function(err, foundUsers){
      if(err) { console.log(err) }
      
      foundUsers.sort(dynamicSort('personalID'));
      console.log(foundUsers);
      
      var userIdNumber = foundUsers.length > 0 ? (foundUsers[foundUsers.length-1].personalID + 1) : 10;
      res.render('users/show',{currentuser:foundUser, users: foundUser.company.users, user: foundUser, userIdNumber:userIdNumber});
    });
  });
});  

//POST - User creation route
router.post("/", middleware.isUserSteward, function(req, res){
  var newUser = new userModel({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      personalID: req.body.personalID,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role
  });
  console.log("New user: ", newUser);
  
  userModel.register(newUser, req.body.password, function(err, createdUser){
    if(err) { 
      console.log(err); 
      res.redirect("/");
    }
    
    userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
      if (err) { console.log(err); }
      
      // Need to find and update company with deleted user
      companyModel.findById(foundUser.company._id, function(err, foundCompany){
        if (err) { console.log(err); }

        foundCompany.users.push(createdUser);
        foundCompany.save();
        createdUser.company = foundCompany._id;
        createdUser.save();
        
        console.log("### Added new user #####", newUser);
        res.redirect("/company/" + foundCompany._id + "/users");
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
router.get("/:id/edit", middleware.isUserSteward, function(req, res){
  userModel.findById(req.params.id, function(err, foundUser){
    if (err) { console.log(err); }
      
    userModel.findById(req.user.id).populate('company').exec(function(err, currentUser){
      if (err) { console.log(err); }
      
      res.render('users/update',{user:currentUser, driver: foundUser});
    });
  });
});

//PUT - User update route
router.put("/:id/edit", middleware.isUserSteward, function(req, res){
  var updatedUser = {
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber
  };
  
  userModel.findByIdAndUpdate(req.params.id, updatedUser, function(err, foundUser){
    if (err) { console.log(err); }
      
    userModel.findById(req.user.id).populate('company').exec(function(err, currentUser){
      if (err) { console.log(err); }
      
      res.redirect("/company/" + currentUser.company._id + "/users/");
    });
  });
});

//POST - Upload user image
router.post("/:id/update-photo", multipartMiddleware, middleware.isUserSteward, function(req, res, next){
    console.log(req.files);
		cloudinary.v2.uploader.upload(req.files.userPic.path, function(error, result) {
		    if (error) { console.log(error); }
      
        userModel.findByIdAndUpdate(req.params.id, {userPic: result}, function(err, updatedUser){
          if(err){ console.log(err); } 
          res.redirect("/company/" + updatedUser.company + "/users/" + updatedUser._id + "/edit");
        });
    });

});

//DELETE - User route to delete item 
router.delete("/:id", middleware.isUserSteward, function(req, res){
  
  userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    // Need to find and update company with deleted user
    companyModel.findById(foundUser.company._id, function(err, foundCompany){
      if (err) { console.log(err); }
  
      var foundUserIndex = foundCompany.users.indexOf(req.params.id);
      if (foundUserIndex != -1) {
        foundCompany.users.splice(foundUserIndex, 1);
        foundCompany.save();
      }
      
      // After company was updated we will remove selected user
      userModel.findByIdAndRemove(req.params.id, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/company/" + foundCompany._id + "/users");
        } else {
          res.redirect("/company/" + foundCompany._id + "/users");
        }        
      });
    });
  });
});  
  

module.exports = router;