const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Tenants} = require("../models/Tenants");
const {Units} = require("../models/Units");

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

router.get("/api/tenant/:id", async (req, res) => {
	const tenants = await Tenants.findOne({ownerId: req.user.id, _id:req.params.id});
	res.json(tenants)
})

module.exports = router