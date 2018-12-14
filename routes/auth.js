var express     = require("express");
var passport    = require("passport");
var userModel   = require('../models/user');
var router      = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now().toLocaleString('it-IT'));
  next();
});

//GET - Login screen
router.get("/login", function(req, res){
    res.render("login/login");
});

//POST - Login into system
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash : true
  }), 
  function(req, res){
    console.log(res.user._id);
});

//GET - Logout user route
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


module.exports = router;