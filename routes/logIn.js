const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const passport = require("passport");
const Users = require("../models/Users");

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' }));

module.exports = router