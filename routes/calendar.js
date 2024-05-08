const router     = new (require('express')).Router()
const moment     = require('moment')
const {Meetings} = require("../models/Meetings");
const {Sales} = require("../models/Sales");

router.get("/api/calendar", async (req, res) => {

	try {

		let results = await Meetings.find()
			.sort({"createdTime": -1})
			.limit(250)

		let sales = await Sales.find({meetingDate: {$exists:true}})
			.sort({"createdTime": -1})
			.limit(250)

		sales = sales.map(r => ({
			salesID: r._doc.salesID,
			meetingDate: moment(new Date(r._doc.meetingDate)).format("YYYY-MM-DD"),
			title: r._doc.salesID + " (Meeting)",
			exClientID: r._doc.exClientID,
			meetingStatus: r._doc.meetingStatus,
			remarks: r._doc.remarks,
			isSales: true
		}))

		results = results.map(r => ({
			...r._doc,
			meetingDate: moment(new Date(r._doc.meetingDate)).format("YYYY-MM-DD")
		}))

		res.json([...results, ...sales])
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/calendar", async (req, res) => {

	try {

		req.body.title = req.body.title.split(' ').filter(Boolean).join(' ')
		req.body.title = req.body.title.replace(/\t/g, ' ')
		req.body.title = req.body.title.replace(/\n/g, ' ')

		let result = await Meetings.create({
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

router.patch("/api/calendar", async (req, res) => {

	try {

		if (!req.body._id)
			return res.status(400).send("No _id present")

		req.body.title = req.body.title.split(' ').filter(Boolean).join(' ')
		req.body.title = req.body.title.replace(/\t/g, ' ')
		req.body.title = req.body.title.replace(/\n/g, ' ')

		let result = await Meetings.updateOne(
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

router.delete("/api/calendar", async (req, res) => {

	try {
		let {_id} = req.query
		
		let _ = await Meetings.deleteMany({_id})

		if (_.deletedCount == 0) throw new Error("No entry found")

		res.send('ok')
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

module.exports = router