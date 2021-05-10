const fs = require('fs');
const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Payments} = require("../models/Payments");
const {Users} = require('../models/Users');
const {Tenants} = require('../models/Tenants');
const {Units} = require('../models/Units');
const mailer = require("../modules/mailer");
const views = require("../viewTemplates");

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

	const today = new Date();
	const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

	const payments = await Payments.find({ownerId: req.user.id, date: { $gte: firstDay }});
	res.json(payments)

})

router.get("/api/payments/month/all", async (req, res) => {

	const today = new Date();
	const firstDay = new Date(today.getFullYear(), parseInt(req.query.month), 1);
	const lastDay = new Date(today.getFullYear(), parseInt(req.query.month) + 1, 0);

	let units = Units.find({ownerId: req.user.id});
	let tenants = Tenants.find({ownerId: req.user.id});
	let payments = Payments.find({ownerId: req.user.id, date: { $gte: firstDay, $lte: lastDay }});

	[units, tenants, payments] = await Promise.all([units, tenants, payments])

	tenants = tenants.map(tenant => {

		const tenantPayments = payments.filter(payment => (String(tenant._id) == String(payment.tenantId)))
		const totalPayment = tenantPayments.reduce((a,b) => (a + b.amount), 0)

		const unit = units.find(unit => (String(tenant.propertyId) == String(unit._id)))

		return {tenant, unit, totalPayment}
	})
	
	res.json(tenants)
})

router.post("/api/payments/report/download", async (req, res) => {

	const today = new Date();
	console.log(req.body, req.query)
	const firstDay = new Date(today.getFullYear(), parseInt(req.body.month), 1);
	const lastDay = new Date(today.getFullYear(), parseInt(req.body.month) + 1, 0);

	let units = Units.find({ownerId: req.user.id});
	let tenants = Tenants.find({ownerId: req.user.id});
	let payments = Payments.find({ownerId: req.user.id, date: { $gte: firstDay, $lte: lastDay }});

	[units, tenants, payments] = await Promise.all([units, tenants, payments])

	tenants = tenants.map(tenant => {

		const tenantPayments = payments.filter(payment => (String(tenant._id) == String(payment.tenantId)))
		const totalPayment = tenantPayments.reduce((a,b) => (a + b.amount), 0)

		const unit = units.find(unit => (String(tenant.propertyId) == String(unit._id)))

		return {tenant, unit, totalPayment}
	})

	const reportFile = await views.reportSave({rows: tenants, month: req.body.month})
	console.log(reportFile)

	res.download(reportFile.filename,(err) => {
		fs.unlink(reportFile.filename, () => {})
	})

})

router.get("/api/payments/tenant", async (req, res) => {
	const payments = await Payments.find({ownerId: req.user.id, ...req.query});
	res.json(payments)

})

module.exports = router