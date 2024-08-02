const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controller/user.js");


//SignUp ROute:- 
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));


//LoginForm and Login Page route:-

router.route("/login")
    .get(userController.renderSigninForm)
    .post(saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);


//Logout Form render and Logout:-
router.get("/logout", userController.logout);

module.exports = router;