var express     = require("express");
var passport    = require("passport");
var db          = require('../models');
var router      = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
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
    res.redirect("/auth/login");
});


module.exports = router;