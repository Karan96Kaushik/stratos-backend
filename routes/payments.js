const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Payments} = require("../models/Payments");

router.post("/payment/add", async (req, res) => {
	console.log(req.body, {...req.body, ownerId: req.user.id})
	const _ = await Payments.create({...req.body, ownerId: req.user.id});
	res.send("OK")

})

router.get("/payments/", async (req, res) => {

	const payments = await Payments.find({ownerId: req.user.id});
	res.json(payments)

})

router.get("/payments/tenant", async (req, res) => {
	console.log(req.query)
	const payments = await Payments.find({ownerId: req.user.id, ...req.query});
	console.log(payments)
	res.json(payments)

})

module.exports = router