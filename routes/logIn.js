const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const passport = require("passport");
const crypto = require("crypto");
const {Members} = require("../models/Members");
const {generate, decode} = require("../modules/auth");
const {encodeAuth, decodeAuth} = require("../modules/authCodec");
const client = require('../scripts/redisClient')

router.post('/api/login', async (req, res) => {
	try{
		req.body.creds.password = crypto.createHmac('sha256', "someSalt")
	    	.update(req.body.creds.password)
			.digest('hex')
		
		let user = await Members.findOne(req.body.creds)

		if(user) {
			const tokenObj = {
				id:user._id, 
				perm:[
					user.permissions.page, 
					user.permissions.service
				]
			}
			
			if (!!user._doc.isAdmin)
				tokenObj.admin = 1
			
			let token = generate(tokenObj)

			user = user._doc
			console.log("SAVING", String(user._id), String(token), String(true))
			await client.hSet(String(user._id), String(token), String(true))

			delete user.password
			delete user.createdTime
			delete user.updateTime

			let permissions = decodeAuth(user.permissions)

			user.permissions = permissions
			res.send({user, token})
		} else {
			res.status(401).send("Email or password Incorrect")
		}
	} catch (err) {
			console.log(err)
			res.status(500).send(err.message)
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