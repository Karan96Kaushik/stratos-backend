const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const passport = require("passport");
const crypto = require("crypto");
const {Users} = require("../models/Users");
const {generate, decode} = require("../modules/auth");

router.post('/api/login', async (req, res) => {

	// console.log(req.body.creds)
	delete req.body.creds.email
	req.body.creds.password = crypto.createHmac('sha256', "someSalt")
    	.update(req.body.creds.password)
		.digest('hex')
		
	let user = await Users.findOne(req.body.creds)

	// console.log(user)

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

router.post('/api/forgot', async (req, res) => {

	let creds = req.body.creds
	// console.log(req.body.creds)
	let query = {}
	if(creds.email.length > creds.phone.length)
		query = {email:creds.email}
	else 
		query = {phone:creds.phone}

	let user = await Users.findOne(query)

	console.log(user)

	if(user) {
		res.send()
	} else {
		res.status(401).send("Email or Phone number Invalid")
	}


})

router.get('/api/changepassword', async (req, res) => {

	console.log(req.query.token)
	console.log(deocde(req.query.token))



})
 
module.exports = router