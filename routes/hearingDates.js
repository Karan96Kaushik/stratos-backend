const router     = new (require('express')).Router()
const moment     = require('moment')
const {HearingDates} = require("../models/HearingDates");
const {Tasks} = require("../models/Tasks");

router.get("/api/hearingdates", async (req, res) => {

	try {
		req.query

		let results = await HearingDates.find()
			.limit(200)

		let tasks = await Tasks.find({hearingDate: {$exists:true}})
			.sort({"createdTime": -1})
			.limit(200)

		tasks = tasks.map(r => ({
			taskID: r._doc.taskID,
			hearingDate: r._doc.hearingDate,
			title: r._doc.taskID + " (Task)",
			clientName: r._doc.clientName,
			remarks: r._doc.remarks,
			isTask: true
		}))

		results = results.map(r => ({
			...r._doc,
			hearingDate: moment(new Date(r._doc.hearingDate)).format("YYYY-MM-DD")
		}))

		res.json([...results, ...tasks])
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/hearingdates", async (req, res) => {

	try {

		req.body.title = req.body.title.split(' ').filter(Boolean).join(' ')
		req.body.title = req.body.title.replace(/\t/g, ' ')
		req.body.title = req.body.title.replace(/\n/g, ' ')

		let result = await HearingDates.create({
			...req.body,
			addedBy: req.user.id
		})
		res.json(result)
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.patch("/api/hearingdates", async (req, res) => {

	try {

		if (!req.body._id)
			return res.status(400).send("No _id present")

		req.body.title = req.body.title.split(' ').filter(Boolean).join(' ')
		req.body.title = req.body.title.replace(/\t/g, ' ')
		req.body.title = req.body.title.replace(/\n/g, ' ')

		let result = await HearingDates.updateOne(
			{
				_id: req.body._id
			},
			{
				...req.body,
				addedBy: req.user.id
			})

		res.json(req.body)
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/hearingdates", async (req, res) => {

	try {
		let {_id} = req.query
		
		let _ = await HearingDates.deleteMany({_id})

		if (_.deletedCount == 0) throw new Error("No entry found")

		res.send('ok')
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

module.exports = router