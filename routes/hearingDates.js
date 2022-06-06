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
			.limit(200)

		tasks = tasks.map(r => ({
			taskID: r._doc.taskID,
			hearingDate: r._doc.hearingDate,
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
		await HearingDates.create({
			...req.body,
			addedBy: req.user.id
		})

		res.send('ok')
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/hearingdates", async (req, res) => {

	try {
		let {taskID} = req.query

		let _ = await HearingDates.deleteMany({taskID})

		if (_.deletedCount == 0) throw new Error("No task found")

		res.send('ok')
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

module.exports = router