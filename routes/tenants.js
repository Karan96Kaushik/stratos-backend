const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Tenants} = require("../models/Tenants");

router.post("/tenants/add", async (req, res) => {
	const _ = await Tenants.create({...req.body, ownerId: req.user.id});
	res.send("OK")
})

router.get("/tenants/", async (req, res) => {
	const tenants = await Tenants.find({ownerId: req.user.id});
	res.json(tenants)
})

module.exports = router