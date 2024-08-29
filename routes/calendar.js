const router     = new (require('express')).Router()
const moment     = require('moment')
const {Meetings} = require("../models/Meetings");
const {Sales} = require("../models/Sales");
const meetingsFields = require('../statics/meetingsFields');
const { generateExcel } = require('../modules/excelProcessor');
const fs = require("fs");

router.get("/api/calendar", async (req, res) => {

	try {

		// let salesQuery = {"$and" : [
		// 	---- // {...req.query}
		// 	{meetingDate: {$exists:true}}
		// ]}

		let meetingsQuery = {}

		// if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R") && !req.permissions.page.includes("Approve Meetings")) {
        //     salesQuery['$and'].push({ $or: [
        //         {addedBy: req.user.id},
        //         {_membersAssigned: req.user.id}
        //     ]})
		// }

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Approve Meetings")) {
			let meetingsQuery = {"$and" : [
			]}
			meetingsQuery['$and'].push({ $or: [
                {addedBy: req.user.id},
                {_membersAssigned: req.user.id}
            ]})
		}

		// {_membersAssigned: req.user.id}


		let results = await Meetings.find(meetingsQuery)
			.sort({"createdTime": -1})
			.limit(250)

		
		let followups = await Sales.find({_membersAssigned: req.user.id, followUpDate: {$exists: true}},)
			.sort({"createdTime": -1})
			.limit(250)

		// let sales = await Sales.find(salesQuery)
		// 	.sort({"createdTime": -1})
		// 	.limit(250)

		// sales = sales.map(r => ({
		// 	_id: r._doc._id,
		// 	salesID: r._doc.salesID,
		// 	meetingDate: moment(new Date(r._doc.meetingDate)).format("YYYY-MM-DD"),
		// 	title: r._doc.salesID + ' - ' + r._doc.promoterName  + " - Meeting",
		// 	exClientID: r._doc.exClientID,
		// 	meetingStatus: r._doc.meetingStatus,
		// 	remarks: r._doc.remarks,
		// 	openlink: '/app/sales/edit/' + r._doc._id,
		// 	isSales: true
		// }))

		results = results.map(r => ({
			...r._doc,
			openlink: r._doc._salesID ? '/app/sales/edit/' + r._doc._salesID : null,
			meetingDate: moment(new Date(r._doc.meetingDate)).format("YYYY-MM-DD")
		}))

		followups = followups.map(r => ({
			...r._doc,
			meetingStatus: 99,
			title: r._doc.salesID + ' - ' + r._doc.promoterName + " - FollowUp",
			openlink: '/app/sales/edit/' + r._doc._id,
			meetingDate: moment(new Date(r._doc.followUpDate)).format("YYYY-MM-DD")
		}))

		res.json([
			...results, 
			// ...sales, 
			...followups])
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
			addedBy: req.user.id,
			meetingStatus: 0,
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

const commonProcessor = async (meetings) => {
	let salesIDs = meetings.map(m => m._salesID)
	let sales = await Sales.find({ _id: { $in: salesIDs } })
	sales = sales.map(s => s._doc)

	meetings = meetings.map(m => {
		let sale = sales.find(s => String(s._id) == String(m._salesID))

		return {
			...m, 
			membersAssigned: Array.isArray(m.membersAssigned) ? m.membersAssigned.join(', ') : m.membersAssigned,
			status: sale.status,
			projectName: sale.projectName,
			promoterName: sale.promoterName,
			exClientID: sale.exClientID,
			callingDate: sale.callingDate ? moment(sale.callingDate).format("DD/MM/YYYY") : undefined,
			meetingDate: sale.meetingDate ? moment(sale.meetingDate).format("DD/MM/YYYY") : undefined,
			totalAmount: sale.totalAmount,
		}
	})

	return meetings
}


router.post("/api/calendar/export", async (req, res) => {
	try{
		req.query = req.body

		if(!(req.query.password == (process.env.ExportPassword ?? "exp"))) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let meetingsQuery = {}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Approve Meetings")) {
			let meetingsQuery = {"$and" : [
			]}
			meetingsQuery['$and'].push({ $or: [
                {addedBy: req.user.id},
                {_membersAssigned: req.user.id}
            ]})
		}

		let results = await Meetings.find(meetingsQuery)
			.collation({locale: "en" })

		results = results.map(val => val._doc)

		results = await commonProcessor(results)

		let file = await generateExcel(results, meetingsFields['all'], "meetingsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.patch("/api/calendar/approve", async (req, res) => {

	try {

		if (!req.body._id)
			return res.status(400).send("No event found")

		// if (req.body.isSales)
			await Meetings.updateOne(
				{
					_id: req.body._id
				},
				{
					meetingStatus: 1
				})
		
		// else
		// 	await Sales.updateOne(
		// 		{
		// 			_id: req.body._id
		// 		},
		// 		{
		// 			meetingStatus: 1
		// 		})

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