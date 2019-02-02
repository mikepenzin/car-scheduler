var express         = require("express");
var db              = require('../models');
var api             = require("../service_api");
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

//GET - General users route
router.get("/", middleware.isUserSteward, function(req, res){
  api.User.getUserByIdAndPopulate(req.user.id, { path: 'company', populate: {path: 'users', model: 'User'} })
  .then(function(foundUser){
 
    api.User.getQueryAndPopulate({}, 'company').sort({personalID : 1})
    .then(function(foundUsers){

      var userIdNumber = foundUsers.length > 0 ? (foundUsers[foundUsers.length-1].personalID + 1) : 10;
      res.render('users/show',{currentuser:foundUser, users: foundUser.company.users, user: foundUser, userIdNumber:userIdNumber});
    });
  });
});  

//POST - User creation route
router.post("/", middleware.isUserSteward, function(req, res){
  var newUser = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      personalID: req.body.personalID,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role
  };
  console.log("New user: ", newUser);
  
  // api.User.createNewUser(newUser, req.body.password)
  // .then(function(createdUser){
  var password = "" + Math.floor(Math.random()*90000) + 10000;
  
  db.User.register(newUser, password, function(err, createdUser) {  
    if(err) {console.log(err);}
    
    api.Company.getCompanyByUserId([req.user.id])
    .then(function(foundCompany){

        foundCompany[0].users.push(createdUser);
        foundCompany[0].save();
        createdUser.company = foundCompany[0]._id;
        createdUser.passwordToken = password;
        createdUser.save();
        
        var message = 'שלום רב, ' + createdUser.firstName + ' ' +  createdUser.lastName + '. ' + ' קוד זמני לכניסה ראשונית למערכת חברת '
        + foundCompany[0].name + ' '
        + ' הינו : '+ password
        + ' להמשך  הרשמה לחץ על לינק הבאה: ' + 'https://car-scheduler.io/';
        
        var phoneNumber = '';
        if (process.env.ENV === 'production') {
          phoneNumber = '972' + createdUser.phoneNumber.substr(1).split(' ').join('');
        } else {
          phoneNumber = '972544958954';
        }
        api.SMS.send(phoneNumber, message);
        
        console.log("### Added new user #####", newUser.firstName + ' ' + newUser.lastName);
        res.redirect("/company/" + foundCompany[0]._id + "/users");
      })
      .catch(function(err){
        console.log(err);
        res.redirect("back");
      });
  });  
});

//GET - User card show route
router.get("/:id", middleware.isLoggedIn, function(req, res){

  api.User.getUserById(req.params.id)
  .then(function(foundUser){    
    
    api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(currentUser){
      
      res.render('users/profile',{user:currentUser, driver: foundUser});
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
});

//GET - User update show route
router.get("/:id/edit", middleware.isUserSteward, function(req, res){
  api.User.getUserById(req.params.id)
  .then(function(foundUser){    
    
    api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(currentUser){
      
      res.render('users/update',{user:currentUser, driver: foundUser});
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
});

//PUT - User update route
router.put("/:id/edit", middleware.isUserSteward, function(req, res){
  var updatedUser = {
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber
  };
  
  api.User.getUserByIdAndUpdate(req.params.id, updatedUser)
  .then(function(foundUser){    
    
    api.User.getUserByIdAndPopulate(req.user.id, 'company')
    .then(function(currentUser){
         
      res.redirect("/company/" + currentUser.company._id + "/users/");
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
});

//POST - Upload user image
router.post("/:id/update-photo", multipartMiddleware, middleware.isUserSteward, function(req, res, next){
	cloudinary.v2.uploader.upload(req.files.userPic.path, function(error, result) {
    if (error) { console.log(error); }
    
    api.User.getUserByIdAndUpdate(req.params.id, {userPic: result})
    .then(function(updatedUser){    
      
      res.redirect("/company/" + updatedUser.company + "/users/" + updatedUser._id + "/edit");
    })
    .catch(function(err){
      console.log(err);
      res.redirect("back");
    });
  });
});

//DELETE - User route to delete item 
router.delete("/:id", middleware.isUserSteward, function(req, res){
  
  api.Company.getCompanyByUserId([req.user.id])
  .then(function(foundCompany){
    
    var foundUserIndex = foundCompany[0].users.indexOf(req.params.id);
    if (foundUserIndex != -1) {
      foundCompany[0].users.splice(foundUserIndex, 1);
      foundCompany[0].save();
    }
    
    // After company was updated we will remove selected user
    api.User.getUserByIdAndRemove(req.params.id)
    .then(function(user){
      res.redirect("/company/" + foundCompany._id + "/users");
    })
    .catch(function(){
      res.redirect("/company/" + foundCompany._id + "/users");
    });
  })
  .catch(function(err){
    console.log(err);
    res.redirect("back");
  });
});  
  

module.exports = router;