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
    
    if (foundUser != 'driver') {
      res.render("main/main", {user: foundUser});
    } else {
      res.render("main/driver", {user: foundUser});
    }
    
  });
    
});

router.get("/404", function(req, res){
      res.render("main/404");
});


module.exports = router;