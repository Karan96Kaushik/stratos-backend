const router     = new (require('express')).Router()
// const mongoose = require("mongoose");
const {Tasks} = require("../models/Tasks");
const {getID, updateID} = require("../models/Utils");
// const crypto = require("crypto");

const serviceCodes = {
	"Agent Registration": "AR",
	"Project Registration": "PR",
	"Extension": "EX",
	"Correction": "CO",
	"Form 5 - Audit": "F5",
	"Form 2A": "FA",
	"Updation": "UP",
	"Form 1": "F1",
	"Form 2": "F2",
	"Form 3": "F3",
	"Others - Tech": "OT",
	"Title Certificate": "TC",
	"Agreement for Sale Draft": "AF",
	"Litigation": "LI",
	"Hourly Package": "RC",
	"Legal Notice": "LN",
	"Registration": "RG",
	"Drafting of Documents": "DD",
	"Others - Legal": "OL",
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
	let others = {}
	const rowsPerPage = parseInt(req.query.rowsPerPage)
	const page = parseInt(req.query.page)-1

	if(req.query.text)
		others[req.query.type] = req.query.text;

	// console.log(req.permissions.page)

	// if(!req.permissions.page.includes("leadsr"))
	// 	others.addedBy = req.user.id

	let results = await Tasks.find({ serviceType: req.query.serviceType, ...others})
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({createdTime:-1});

	results = results.map(val => ({...val._doc, createdTime:val.createdTime.toISOString().split("T")[0]}))

	// console.log(clients)
	res.json(results)
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