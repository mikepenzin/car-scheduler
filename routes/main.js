var express         = require("express");
var middleware      = require('../middleware');
var companyModel    = require('../models/company');
var userModel       = require('../models/user');
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
  
  userModel.findById(req.user.id).populate('company').exec(function(err, foundUser){
    if (err) { console.log(err); }
    
    console.log(foundUser);
    res.render("main/main-page", {user: foundUser});
  });
    
});


module.exports = router;