const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const Users = require("../models/Users");

/*
* The Route GET /user is used for show the admin user.
*/
router.post("/signup", async (req, res) => {
	let _;

	let data = await Users.findOne({email:req.user.email});

	if(data)
		throw new Error({message: "Email ID Exists"})

	_ = await model.create(req.user);

})

module.exports = router
