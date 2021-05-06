const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Payments} = require("../models/Payments");

router.post("/payment/add", async (req, res) => {

	const _ = await Payments.create({...req.body, ownerId: req.user.id});
	res.send("OK")

})

router.get("/payments/", async (req, res) => {

	const payments = await Payments.find({ownerId: req.user.id});
	res.json(payments)

})

module.exports = router