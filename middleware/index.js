var api         = require("../services/api");
var middlewareObj = {};

middlewareObj.isLoggedInMainPage = function (req, res, next) {
    if(req.isAuthenticated()){
        if(req.user.isActivated) {
            return next();
        } else {
            res.render("login/activation", {foundUser:foundUser});
        }        
    } else {
        res.redirect("/auth/login");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        // req.flash("error", "אתה מנסה לגשת לדף אינך מורשה להיכנס, היכנס למערכת תחילה!");
        res.redirect("/auth/login");
    }
};

middlewareObj.isUserDriver = function (req, res, next) {
    if(req.isAuthenticated()){
        if(req.user.role === "driver") {
            return next();   
        } else {
            // req.flash("error", "You don't have enough rating to create posts!");
            res.redirect("back");
        }
    } else {
        // req.flash("error", "אתה מנסה לגשת לדף אינך מורשה להיכנס, היכנס למערכת תחילה!");
        res.redirect("/auth/login");
    }
};

middlewareObj.isUserSteward = function (req, res, next) {
    if(req.isAuthenticated()){
        if(req.user.role === "steward") {
            return next();   
        } else {
            // req.flash("error", "You don't have enough rating to create posts!");
            res.redirect("back");
        }
    } else {
        // req.flash("error", "אתה מנסה לגשת לדף אינך מורשה להיכנס, היכנס למערכת תחילה!");
        res.redirect("/auth/login");
    }
};

middlewareObj.isUserAdmin = function(req, res,next) {
    if(req.isAuthenticated()){
        if(req.user.role === "admin") {
            return next();   
        } else {
            // req.flash("error", "You don't have enough rating to create posts!");
            res.redirect("back");
        }
    } else {
        // req.flash("error", "אתה מנסה לגשת לדף אינך מורשה להיכנס, היכנס למערכת תחילה!");
        res.redirect("/auth/login");
    }
};

module.exports = middlewareObj;