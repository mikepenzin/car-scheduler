var express     = require("express");
var api         = require("../service_api");
var passport    = require("passport");
var middleware  = require("../middleware");
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
    // successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash : true
}), 
function(req, res) {
    console.log(req.user.id);
    
    if (req.user.isActivated) {
        res.redirect('/');
    } else {
        res.redirect('/auth/set-password/' + req.user.id);  
    }
});

//GET - password-activation route
router.get("/set-password/:user_id", function(req, res){
    api.User.getUserById(req.params.user_id)
    .then(function(foundUser){
        if(foundUser.isActivated) {
            res.redirect('/');
        } else {
            res.render("login/activation", {foundUser:foundUser});
        }
    })
    .catch(function(err){
        console.log(err);
    });
});

//POST - password-activation route
router.post("/set-password/:user_id", function(req, res){
    api.User.getUserById(req.params.user_id)
    .then(function(foundUser){
        if(foundUser.passwordToken == req.body.passwordToken && req.body.password == req.body.passwordRepeat) {
            
            foundUser.setPassword(req.body.password, function(err){
                if(err) { console.log(err); }
                
                foundUser.passwordToken = undefined;
                foundUser.isActivated = true;
                foundUser.save();
                
                res.redirect('/');
            });    
        }
    })
    .catch(function(err){
        console.log(err);
    });
});

//GET - Logout user route
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/auth/login");
});


module.exports = router;