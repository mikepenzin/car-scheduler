var express         = require("express");
var api             = require("../service_api");
var middleware      = require('../middleware');
var router          = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  let d = new Date();
  let n = d.toLocaleString('it-IT');
  console.log('Time: ', n);
  next();
});

// GET - profile view for company
router.get("/:id", middleware.isUserSteward , function(req, res){

  api.User.getUserByIdAndPopulate(req.user.id, 'company')  
  .then(function(foundUser){
    res.render("company/profile", {user: foundUser, company: foundUser.company});
  })
  .catch(function(err){
    console.log(err);
    res.redirect("back");
  });
});

// GET - Update route for company
router.get("/:id/edit", middleware.isUserSteward , function(req, res){
  
  api.User.getUserByIdAndPopulate(req.user.id, 'company')  
  .then(function(foundUser){ 
    res.render("company/update", {user: foundUser, company: foundUser.company});
  })
  .catch(function(err){
    console.log(err);
    res.redirect("back");
  });
});



module.exports = router;