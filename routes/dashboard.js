const router     = new (require('express')).Router()
const moment = require("moment");
const {Invoices} = require("../models/Invoices");
const {Tasks} = require("../models/Tasks");
const {Members} = require("../models/Members");
const {Clients} = require("../models/Clients");
const {getID, updateID} = require("../models/Utils");
const fs = require('fs');
const {Sales} = require('../models/Sales');

router.get("/api/dashboard/", async (req, res) => {
	try{

		let others = {}

		let query = {
			$or:[
				{ addedBy: req.user.id},
				{ _memberID: req.user.id},
			]
		}

		let results = await Tasks.find(query)

		results = results.map(val => val._doc)

		let added = results.filter(val => String(val.addedBy) == String(req.user.id))
		let assigned = results.filter(val => String(val._memberID) == String(req.user.id))
		let taskStatus = {}

		assigned.forEach(val => {
			taskStatus[val.status ?? "Unknown"] = (taskStatus[val.status ?? "Unknown"] ?? 0) + 1
		})

		query = {
			$or:[
				{ addedBy: req.user.id },
			]
		}

		results = await Clients.find(query)

		res.json({
			added: added.length, 
			assigned: assigned.length,
			taskStatus,
			addedClients: results.length
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/dashboard/calendar/followups", async (req, res) => {

	try {

		let tomorrow = new Date(+new Date() + 1*24*60*60*1000)
		let startdate = new Date(+new Date() - 1*24*60*60*1000)

		console.debug(startdate, tomorrow)

		let followupsQuery = {"$and" : [
			// {...req.query}
			// {meetingDate: {$exists:true}},
			{ _membersAssigned: req.user.id },
			{ followUpDate: { $lt: tomorrow } },
			{ followUpDate: { $gt: startdate } },
		]}

		let followups = await Sales.find(followupsQuery)
			.sort({"createdTime": 1})
			.limit(250)

		followups = followups.map(r => ({
			...r._doc,
			salesID: r._doc.salesID,
			followUpDate: moment(new Date(r._doc.followUpDate)).format("DD-MM-YYYY"),
		}))

		res.json(followups)
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/dashboard/calendar/meetings", async (req, res) => {

	try {

		let tomorrow = new Date(+new Date() + 1*24*60*60*1000)
		let startdate = new Date(+new Date() - 1*24*60*60*1000)

		console.debug(startdate, tomorrow)

		let meetingsQuery = {"$and" : [
			{ _membersAssigned: req.user.id },
			{ meetingDate: { $lt: tomorrow } },
			{ meetingDate: { $gt: startdate } },
		]}

		let meetings = await Sales.find(meetingsQuery)
			.sort({"createdTime": 1})
			.limit(250)

		meetings = meetings.map(r => ({
			...r._doc,
			salesID: r._doc.salesID,
			meetingDate: moment(new Date(r._doc.meetingDate)).format("DD-MM-YYYY"),
		}))

		res.json(meetings)
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/dashboard/sales", async (req, res) => {
	try{

		console.debug(req.query)
        let query = {}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
            query['$and'] = query['$and'] || []
			query['$and'].push({ $or: [
                {addedBy: req.user.id},
                {_membersAssigned: req.user.id}
            ]})
		}

		let results = await Sales.aggregate([
			{ $match: query },
			{ $facet: {
				"countAfterToday": [
					{ $match: { callingDate: { $gt: new Date() } } },
					{ $count: "count" }
				],
				"countToday": [
					{ $match: { callingDate: { $gt: new Date(+new Date() - 1*24*3600*1000) } } },
					{ $count: "count" }
				],
			}}
		])

		let countToday = results.length > 0 ? results[0].countToday[0]?.count : 0;
		let countAfterToday = results.length > 0 ? results[0].countAfterToday[0]?.count : 0;

		query['$and'] = query['$and'] || []

		query['$and'].push({callingDate: { $gt: new Date(req.query.startDate) }})
		query['$and'].push({callingDate: { $lt: new Date(req.query.endDate) }})

		console.log(query)

		results = await Sales.aggregate([
			{ $match: query },
			{ $facet: {
				"totalCount": [
					{ $count: "count" }
				],
				"countPending": [
					// Filter documents where updatedAt is less than callingDate
					{ $match: { $expr: { $lt: ["$updateTime", "$callingDate"] } } },
					{ $count: "count" }
				]
			}}
		])

		let totalCount = results[0]?.totalCount[0]?.count || 0;
		let countPending = results[0]?.countPending[0]?.count || 0;

		res.json({
			'Total': totalCount,
			'Future': countAfterToday,
			'Today': countToday,
			'Pending': countPending,
		})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/dashboard/meetings", async (req, res) => {
	try{

		console.debug(req.query)
        let query = {}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
            query['$and'] = query['$and'] || []
			query['$and'].push({ $or: [
                {addedBy: req.user.id},
                {_membersAssigned: req.user.id}
            ]})
		}

		let results = await Sales.aggregate([
			{ $match: query },
			{ $facet: {
				"countAfterToday": [
					{ $match: { meetingDate: { $gt: new Date() } } },
					{ $count: "count" }
				],
				"countToday": [
					{ $match: { meetingDate: { $gt: new Date(+new Date() - 1*24*3600*1000) } } },
					{ $count: "count" }
				],
			}}
		])

		let countToday = results.length > 0 ? results[0].countToday[0]?.count : 0;
		let countAfterToday = results.length > 0 ? results[0].countAfterToday[0]?.count : 0;

		query['$and'] = query['$and'] || []

		query['$and'].push({meetingDate: { $gt: new Date(req.query.startDate) }})
		query['$and'].push({meetingDate: { $lt: new Date(req.query.endDate) }})

		console.log(query)

		results = await Sales.aggregate([
			{ $match: query },
			{ $facet: {
				"totalCount": [
					{ $count: "count" }
				],
				"countPending": [
					// Filter documents where updatedAt is less than callingDate
					{ $match: { $expr: { $lt: ["$updateTime", "$meetingDate"] } } },
					{ $count: "count" }
				]
			}}
		])

		let totalCount = results[0]?.totalCount[0]?.count || 0;
		let countPending = results[0]?.countPending[0]?.count || 0;

		res.json({
			'Total': totalCount,
			'Future': countAfterToday,
			'Today': countToday,
			'Pending': countPending,
		})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router