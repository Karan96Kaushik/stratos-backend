const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Units} = require("../models/Units");

router.post("/properties/add", async (req, res) => {
	const save = await Units.create({...req.body, ownerId: req.user.id});
	res.send("OK")
})

router.get("/properties/", async (req, res) => {
	const all = await Units.find({ownerId: req.user.id});
	res.json(all)
})

module.exports = router