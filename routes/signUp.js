const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Users} = require("../models/Users");
const {generate} = require("../modules/auth")
let crypto = require('crypto');

/*
* The Route GET /user is used for show the admin user.
*/
router.post("/signup", async (req, res) => {
	let _;

	let data = await Users.findOne({email:req.body.info.email});

	if(data)
		throw new Error({message: "Email ID Exists"})

	req.body.info.password = crypto.createHmac('sha256', "someSalt")
    	.update(req.body.info.password)
		.digest('hex')

	const save = await Users.create({...req.body.info, isActive:true});

	res.send(generate({id:save._id}))

})

module.exports = router
