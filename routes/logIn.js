const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const passport = require("passport");
const crypto = require("crypto");
const {Users} = require("../models/Users");
const {generate} = require("../modules/auth");

router.post('/login', async (req, res) => {

	console.log(req.body.creds)
	req.body.creds.password = crypto.createHmac('sha256', "someSalt")
    	.update(req.body.creds.password)
		.digest('hex')
		
	let user = await Users.findOne(req.body.creds)

	if(user) {
		let token = generate({id:user._id})

		delete user.password
		delete user.createdTime
		delete user.updateTime

		res.send({user, token})
	} else {
		res.status(401).send("Email or password Incorrect")
	}


})
 
module.exports = router