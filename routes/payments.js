const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Payments} = require("../models/Payments");
const {Users} = require('../models/Users');
const {Tenants} = require('../models/Tenants');
const {Units} = require('../models/Units');
const mailer = require("../modules/mailer");

router.post("/api/payment/add", async (req, res) => {
	// console.log(req.body)
	const payment = await Payments.create({...req.body, ownerId: req.user.id});
	const owner = await Users.findOne({_id: req.user.id});
	const tenant = await Tenants.findOne({_id: req.body.tenantId});
	const unit = await Units.findOne({_id: tenant.propertyId});
	// console.log({...tenant._doc, ...unit._doc, owner})
	await mailer.sendPdf(tenant.email, "receipt", {...tenant._doc, ...unit._doc, ...req.body, owner, payment})

	res.send("OK")

})

router.get("/api/payments/", async (req, res) => {

	const payments = await Payments.find({ownerId: req.user.id});
	res.json(payments)

})

router.get("/api/payments/month", async (req, res) => {

	const payments = await Payments.find({ownerId: req.user.id, date: { $gte: new Date("2021-05-01") }});
	res.json(payments)

})

router.get("/api/payments/tenant", async (req, res) => {
	const payments = await Payments.find({ownerId: req.user.id, ...req.query});
	res.json(payments)

})

module.exports = router