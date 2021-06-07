const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Tasks} = require("../models/Tasks");
const crypto = require("crypto");

router.post("/api/tasks/add", async (req, res) => {
	try {
		let _;
		_ = await Tasks.create({...req.body, addedBy: req.user.id});
		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get("/api/tasks/", async (req, res) => {
	// console.log(req.query)
	const tasks = await Tasks.find({...req.query});
	// console.log(tasks)
	res.json(tasks)
})

module.exports = router