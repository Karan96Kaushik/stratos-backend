const router     = new (require('express')).Router()
const moment = require("moment");
const fs = require("fs");

const {Tickets} = require("../models/Tickets");
const {TicketMessages} = require("../models/TicketMessages");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const { uploadFiles, saveFilesToLocal } = require("../modules/fileManager");
const { 
	newTicketMessageNotification, 
	newTicketAssignedNotification 
} = require('../modules/notificationHelpers');
const { setReadTime, getAllReadTime, getReadTime, setLastMessageTime } = require('../modules/ticketHelper');

const tmpdir = "/tmp/"

router.post("/api/tickets/add", async (req, res) => {
	try {

		// const memberInfo = await Members.findOne({_id: req.user.id})
		let _
		let ticketID = "TK" + await getID("TK")
		let createdTick = await Tickets.create({
			...req.body,
			ticketID,
			lastMessageTime: +new Date,
			addedBy: req.user.id
		});
		_ = await updateID("TK")

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, ticketID)
		}

		await newTicketAssignedNotification({
			...req.body,
			ticketID,
			_id: createdTick._id,
		})
		await setLastMessageTime(createdTick._id)
		await setReadTime(req.user.id, createdTick._id)

		res.send("OK")
		
	} catch (err) {
		res.status(500).send(err.message)
	}

})

const generateQuery = (req) => {

	let query = {
		$and:[
			{
				$or:[
					{ ticketID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ subject: { $regex: new RegExp(req.query.text) , $options:"i" }},
					// { ticketID: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		// filter is range - date/number
		if(typeof req.query.filters[filter] == "object") {
			req.query.filters[filter].forEach((val,i) => {
				if(val == null)
					return

				let operator = i == 0 ? "$lt" : "$gt"
				query['$and'].push({
					[filter]: {
						[operator]: val
					}
				})	
			})
		} 
		// filter is normal value
		else {
			query['$and'].push({
				[filter]: req.query.filters[filter]
			})	
		}
	})

	// non tickets-read user can only view their own added tickets or assigned ones
	if(!req.permissions.isAdmin && !req.permissions.page.includes("Tickets R")) {
		query['$and'].push({ $or: [
			{addedBy: req.user.id},
			{_membersAssigned: req.user.id}
		]})
	}

	return query
}

const commonProcessor = (results, lastReads) => {
	// created & followup timestamp
	results = results.map(val => ({
		...val, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followUpDate: !val.followUpDate ? "" : moment(new Date(val.followUpDate)).format("DD-MM-YYYY"),
		isBold: val.lastMessageTime ? (lastReads[val._id] ? val.lastMessageTime > Number(lastReads[val._id]) : true) : false
	}))

	return results
}

router.post("/api/tickets/search", async (req, res) => {
	try{

		req.query = req.body

		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Tickets.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => val._doc)

		const lastReads = await getAllReadTime(req.user.id)
		results = commonProcessor(results, lastReads)

		const member = await Members.findOne({_id: req.user.id})

		res.json({tickets: results, unread: member?._doc?.unread})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/tickets/", async (req, res) => {
	try{
		let query = {"$and" : [{...req.query}]}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Tickets R")) {
			query["$and"].push({
				"$or" : [
					{addedBy:req.user.id}, 
					{_membersAssigned:req.user.id}
				]
			})
		}

		let tickets = await Tickets.findOne({...query});
		tickets = tickets._doc

		let files = await getAllFiles(tickets.ticketID + "/")
		files = files.map(f => f.Key)
		tickets.files = files
		
		let unread
		const lastRead = await getReadTime(req.user.id, req.query._id)
		if (lastRead < tickets.lastMessageTime) {
			const member = await Members.findOneAndUpdate({ _id: req.user.id, unread: { $gt: 0 } }, { $inc: { unread: -1 } }, { new: true })
			unread = member?._doc?.unread
		}

		res.json({tickets, unread})

		await setReadTime(req.user.id, req.query._id)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/messages/add", async (req, res) => {
	try{
		if (!req.body._ticketID) throw new Error("No ticket ID")

		const memberInfo = await Members.findOne({_id: req.user.id})

		await TicketMessages.create({ 
			...req.body,
			addedBy: req.user.id,
			memberName:memberInfo.userName
		})

		res.json({ 
			...req.body,
			addedBy: req.user.id,
			memberName:memberInfo.userName,
			createdTime: moment(new Date()).format("DD-MMM HH:mm")
		})
		
		try {
			await setReadTime(req.user.id, req.body._ticketID)
			const ticket = await Tickets.findOneAndUpdate({ 
				_id: req.body._ticketID 
			}, { lastMessageTime: +new Date })
			
			// const ticket = await Tickets.findOne({ _id: req.body._ticketID })
			await newTicketMessageNotification(ticket._doc, req.user.id)
			await setLastMessageTime(ticket._doc._id)

		}
		catch (err) {
			console.error("Error in notif", err)
		}

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/messages", async (req, res) => {
	try{

		const sortID = "createdTime"
		const sortDir = 1

		let results = await TicketMessages.find({ _ticketID: req.query._ticketID })
			.collation({locale: "en" })
			.limit(100)
			// .skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || 1});

		results = results.map(val => val._doc).map(v => ({...v, createdTime: moment(new Date(v.createdTime)).format("DD-MMM HH:mm"),}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/tickets/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		const _id = req.query._id
		delete req.query._id

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Tickets R")) {
			let result = await Tickets.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to delete this task")
				return
			}
		}

		await Tickets.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/tickets/update", async (req, res) => {
	try {
		let _id = req.body._id

		let ticketID = req.body.ticketID
		delete req.body._id
		delete req.body.ticketID
		delete req.body.addedBy

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Tickets R")) {
			console.debug(_id)
			let result = await Tickets.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to update this task")
				return
			}
		}

		let files
		if(req.body.docs?.length) {
			files = await Promise.all(req.body.docs.map(async (file) => new Promise((resolve, reject) => {
				file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
				file.name = parseInt(Math.random()*1000) + "_" + file.name

				let fileName = tmpdir + +new Date + "_" + file.name

				const fileContents = Buffer.from(file.data, 'base64')
				fs.writeFile( fileName, fileContents, 'base64', (err) => {
					// console.log(err)
					if (err) reject(err)
					resolve({name:file.name,path:fileName})
				})
			})))
			// console.log(files)

		}

		let _ = await Tickets.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, ticketID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router