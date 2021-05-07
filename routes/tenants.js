const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const { payments } = require('.');
const {Tenants} = require("../models/Tenants");
const {Units} = require("../models/Units");
const {Payments} = require("../models/Payments");

router.post("/api/tenants/add", async (req, res) => {
	const _ = await Tenants.create({...req.body, ownerId: req.user.id});
	res.send("OK")
})

router.get("/api/tenants/", async (req, res) => {
	let tenants = Tenants.find({ownerId: req.user.id});
	let units = Units.find({ownerId: req.user.id});

	[tenants, units] = await Promise.all([tenants, units])

	tenants = tenants.map(tenant => {
		let unit = units.find(unit => String(unit._id) == String(tenant.propertyId))

		return {...tenant._doc, property:unit._doc.name}
	})

	res.json(tenants)
})

router.get("/api/tenants/dues", async (req, res) => {
	let tenants = Tenants.find({ownerId: req.user.id});
	let units = Units.find({ownerId: req.user.id});
	let payments = Payments.find({ownerId: req.user.id});

	[tenants, units, payments] = await Promise.all([tenants, units, payments])

	tenants = tenants.map(tenant => {
		let unit = units.find(unit => String(unit._id) == String(tenant.propertyId))
		let tenantPayments = payments.filter(pmt => String(pmt.tenantId) == String(tenant._id))

		const pending = tenant.rent - tenantPayments.reduce((a,b) => a+b.amount,0)

		if(pending > 0)
			return {...tenant._doc, property:unit._doc.name, dueAmount: pending}
		return null
	})


	res.json(tenants.filter(Boolean))
})

router.get("/api/tenant/:id", async (req, res) => {
	const tenants = await Tenants.findOne({ownerId: req.user.id, _id:req.params.id});
	res.json(tenants)
})

module.exports = router