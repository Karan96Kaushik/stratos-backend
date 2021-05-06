const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Units} = require("../models/Units");
const {Tenants} = require("../models/Tenants");
const {Payments} = require("../models/Payments");

router.post("/properties/add", async (req, res) => {
	const save = await Units.create({...req.body, ownerId: req.user.id});
	res.send("OK")
})

router.get("/properties/", async (req, res) => {
	let units = Units.find({ownerId: req.user.id});
	let tenants = Tenants.find({ownerId: req.user.id});
	let payments = Payments.find({ownerId: req.user.id});

	[units, tenants, payments] = await Promise.all([units, tenants, payments])

	units = units.map(unit => {

		const tenant = tenants.find(tenant => (String(tenant.propertyId) == String(unit._id)))

		if(!tenant)
			return ({...unit._doc})
		let lastPmt = 0
		let history = []

		payments.forEach(pmt => {
			if(String(pmt.tenantId) != String(tenant._id))
				return

			history.push(pmt)

			if(+pmt.date > +lastPmt)
				lastPmt = pmt.date
		})

		return {...unit._doc, lastPmt, history}
	})

	res.json(units)
})

module.exports = router