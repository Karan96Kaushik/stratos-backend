const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Members} = require("../models/Members");
const crypto = require("crypto");

router.post("/api/members/add", async (req, res) => {
	try {
		let _;

		let data = await Members.findOne({email:req.body.email});

		if(data)
			throw new Error("Email ID Exists")

		req.body.password = crypto.createHmac('sha256', "someSalt")
			.update(req.body.password)
			.digest('hex')

		_ = await Members.create({...req.body, addedBy: req.user.id});
		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get("/api/members/", async (req, res) => {
	console.log(req.query)
	const members = await Members.find({});
	console.log(members)
	res.json(members)
})

module.exports = router