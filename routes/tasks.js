const router     = new (require('express')).Router()
// const mongoose = require("mongoose");
const {Tasks} = require("../models/Tasks");
const {getID, updateID} = require("../models/Utils");
// const crypto = require("crypto");

const serviceCodes = {
	agentRegistration: "AR",
	projectRegistration: "PR"
}

router.post("/api/tasks/add", async (req, res) => {
	try {
		let _;
		let serviceCode = serviceCodes[req.body.serviceType]

		_ = await Tasks.create({
			...req.body,
			taskID:serviceCode + await getID(serviceCode),
			addedBy: req.user.id
		});
		_ = await updateID(serviceCode)
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

router.get("/api/tasks/search", async (req, res) => {
	// console.log(req.query)
	const tasks = await Tasks.find({...req.query});
	// console.log(tasks)
	res.json(tasks)
})

router.post("/api/tasks/update", async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body._id
		delete req.body.taskID
		delete req.body.serviceType
		delete req.body.clientID
		delete req.body._clientID
		delete req.body.clientName

		let _ = await Tasks.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router