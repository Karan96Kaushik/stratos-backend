const router     = new (require('express')).Router()
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {getID, updateID} = require("../models/Utils");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const {generateExcel} = require("../modules/excelProcessor");
const {taskFields, taskPayments} = require("../statics/taskFields");
const fs = require("fs");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const crypto = require('crypto');
const {Members} = require("../models/Members");

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

const checkR = (req, res, next) => {
	const isPermitted = req.permissions.page.includes("Tasks R")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkW = (req, res, next) => {
	const isPermitted = req.permissions.page.includes("Tasks W")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkTaskPermission = (req, taskType) => {
	return req.permissions.service.includes(taskType)
}

router.post("/api/tasks/add", checkW, async (req, res) => {
	try {
		let _;
		let serviceCode = serviceCodes[req.body.serviceType]

		// if(!checkTaskPermission(req, req.body.serviceType)) {
		// 	res.status(401).send("Unauthorized to create this task")
		// 	return
		// }

		if(!req.body.archived)
			req.body.archived = false

		req.body.totalAmount = calculateTotal(req.body)
		req.body.balanceAmount = req.body.totalAmount

		let taskID = serviceCode + await getID(serviceCode)
		_ = await Tasks.create({
			...req.body,
			taskID,
			docs:null,
			files:null,
			addedBy: req.user.id
		});
		_ = await updateID(serviceCode)

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, taskID)
		}
		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get("/api/tasks/", async (req, res) => {
	let query = {"$and" : [{...req.query}]}

	if(!checkR(req)) {
		query["$and"].push({
			"$or" : [
				{addedBy:req.user.id}, 
				{_memberID:req.user.id}
			]
		})
	}

	const tasks = await Tasks.findOne(query);
	let files = await getAllFiles(tasks.taskID + "/")

	files = files.map(f => f.Key)
	res.json({...tasks._doc, files})
})

router.delete("/api/tasks/", checkW, async (req, res) => {

	if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
		res.status(401).send("Incorrect password")
		return
	}
	delete req.query.password
	
	let task = await Tasks.findOne({_id: req.query._id})

	if(task.addedBy != req.user.id) {
		res.status(401).send("Unauthorized to delete this task")
		return
	}

	await Tasks.deleteOne({...req.query});
	res.send("ok")
})

const generateQuery = (req) => {

	let query = {
		$and:[
		],
	}

	if(req.query.text) {
		query.$and.push({
			$or:[
				{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ membersAssigned: { $regex: new RegExp(req.query.text) , $options:"i" }},
				// { memberName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ totalAmount: Number(req.query.text)},
				{ billAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ ca: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ engineer: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ status: { $regex: new RegExp(req.query.text) , $options:"i" }},
			]
		})
	}

	// search only the tasks that are permitted
	if(!req.query.serviceType)
		query['$and'].push({'$or':
			req.permissions.service.map((svc) => ({
				serviceType: svc
			}))
		})

	// search only the non-archived tasks if not specified exclusively
	if(!req.query.filters.archived)
		query['$and'].push({
			archived:false
		})
	delete req.query.filters.archived

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		if(filter == "balanceStatus") {
			if(req.query.filters[filter] == "Nil") 
				query['$and'].push({
					balanceAmount: {$lte:0}
				})
			else if(req.query.filters[filter] == "Pending") 
				query['$and'].push({
					balanceAmount: {$gt:0}
				})

			return
		}
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
	if(!req.query.searchAll) {
		query['$and'].push({
			serviceType: req.query.serviceType
		})
	}

	if(!checkR(req))
		query['$and'].push({
			$or:[
				{addedBy: req.user.id},
				{_memberID: req.user.id},
				{_membersAssigned: req.user.id},
			]
		})
	
	return query
}

const commonProcessor = (results) => {

	results = results.map(val => ({
		...val._doc, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		billAmount: undefined,
		gst: undefined,
		govtFees: undefined,
		sroFees: undefined
	}))

	return results

}

router.post("/api/tasks/search", async (req, res) => {

	try {
		req.query = req.body

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)

		if(!req.query.serviceType && !req.query.searchAll) {
			res.json([])
			return
		}

		if(req.query.serviceType && !checkTaskPermission(req, req.query.serviceType)) {
			res.status(401).send("Unauthorized to view this task type")
			return
		}

		let query = generateQuery(req)
		let results = await Tasks.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = commonProcessor(results)

		res.json(results)
	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/tasks/export", async (req, res) => {
	try{
		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Tasks.find(query)
			.collation({locale: "en" })

		results = commonProcessor(results)

		let file = await generateExcel(results, taskFields[req.query.searchAll ? "all" : req.query.serviceType], "tasksExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

const calculateTotal = (val) => (
	Number(val.billAmount ?? 0) +
	Number(val.gst ?? 0) +
	Number(val.govtFees ?? 0) +
	Number(val.sroFees ?? 0)
)

const generateQueryPayments = async (req) => {

	let query = {}

	if(req.query.text || Object.keys(req.query.filters).length || !req.query.filters.archived)
		query.$and = []

	if(req.query.text)
		query.$and.push({
			$or:[
				{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ receivedAmount: Number(req.query.text)},
				{ balanceAmount: Number(req.query.text)},
				{ totalAmount: Number(req.query.text)},
				{ billAmount: Number(req.query.text)},
				{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
			]
		})

	// search only the non-archived tasks if not specified exclusively
	if(!req.query.filters.archived)
		query['$and'].push({
			archived:false
		})
	delete req.query.filters.archived

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		if(filter == "balanceStatus") {
			if(req.query.filters[filter] == "Nil") 
				query['$and'].push({
					balanceAmount: {$lte:0}
				})
			else if(req.query.filters[filter] == "Pending") 
				query['$and'].push({
					balanceAmount: {$gt:0}
				})

			return
		}

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
	return query

}

const commonProcessorPayments = async (results) => {
	let taskIDs = results.map(val => (val.taskID))
	taskIDs = await Payments.find({
		taskID: {$in:taskIDs}
	})

	results = results.map(val => ({...val._doc, payments: taskIDs.filter((v) => (val.taskID == v.taskID))}))
	results = results.map(val => ({...val, received: val.payments.reduce((tot, curr) => ((Number(curr._doc.receivedAmount) ?? 0) + tot),0)}))
	results = results.map(val => ({...val, createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))
	results = results.map(val => ({...val, total: calculateTotal(val)}))
	results = results.map(val => ({...val, balance: val.total - val.received}))

	results = results.map(val => ({
		...val,
		payments: taskIDs
			.filter((v) => (val.taskID == v._doc.taskID))
			.map(v => (
				(v._doc.paymentDate ? moment(new Date(v._doc.paymentDate)).format("DD-MM-YYYY") + " - " : v._doc.createdTime ? (moment(new Date(v._doc.createdTime)).format("DD-MM-YYYY") + " - ") : " - ") +
				"₹" + v._doc.receivedAmount + " - " +
				v._doc.mode
			))
	}))

	return results
}

const searchBillAmount = async (amount) => {

	let query = {
		$and:[
			{
				$or:[
					{ receivedAmount: { $regex: new RegExp(amount) , $options:"i" }},
				]
			}
		],
	}

	let result = await Payments.find(query)

	result = result.map(val => val.taskID)

}

router.post("/api/tasks/payments/search", async (req, res) => {

	req.query = req.body

	if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
		res.status(401).send("Unauthorized access")
		return
	}

	let others = {}
	const rowsPerPage = parseInt(req.query.rowsPerPage)
	const page = parseInt(req.query.page)-1
	const sortID = req.query.sortID
	const sortDir = parseInt(req.query.sortDir)

	let query = await generateQueryPayments(req)

	let results = await Tasks.find(query)
		.collation({locale: "en" })
		.limit(rowsPerPage)
		.skip(rowsPerPage * page)
		.sort({[sortID || "createdTime"]: sortDir || -1});

	results = await commonProcessorPayments(results)
	res.json(results)
})

router.post("/api/tasks/payments/export", async (req, res) => {

	req.query = req.body

	if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
		res.status(401).send("Incorrect password")
		return
	}
	delete req.query.password

	if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
		res.status(401).send("Unauthorized access")
		return
	}

	let query = await generateQueryPayments(req)
	
	let results = await Tasks.find(query)
		.collation({locale: "en" })

	results = await commonProcessorPayments(results)
	
	let file = await generateExcel(results, taskPayments["all"], "taskPaymentsExport" + (+new Date))

	res.download("/tmp/" + file,(err) => {
		fs.unlink("/tmp/" + file, () => {})
	})
})

router.get("/api/tasks/search/all", async (req, res) => {
	let query = req.query

	const tasks = await Tasks.find(query);

	res.json(tasks)
})

router.get("/api/tasks/payments/search/add", async (req, res) => {
	try {

		if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
			res.status(401).send("Unauthorized access")
			return
		}
		
		let query = req.query

		let task = await Tasks.findOne(query);
		if(!task)
			throw new Error("Task not found")
		task = task._doc
		task._taskID = task._id

		if(!task.clientID || !task.clientName) {
			let client = await Clients.findOne({_id: task._clientID})
			task.clientID = client.clientID
			task.clientName = client.name
		}

		res.json(task)

	} catch (err) {
		res.status(500).send(err.message)
	}

})

router.get("/api/clients/payments/search/add", async (req, res) => {
	try {

		if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
			res.status(401).send("Unauthorized access")
			return
		}
		
		let query = req.query

		let client = await Clients.findOne({clientID: req.query.clientID})

		res.json(client)

	} catch (err) {
		res.status(500).send(err.message)
	}

})

router.post("/api/tasks/update", async (req, res) => {
	try {
		let _id = req.body._id
		let taskID = req.body.taskID

		delete req.body._id
		delete req.body.taskID
		delete req.body.serviceType
		delete req.body.clientID
		delete req.body._clientID
		delete req.body.clientName

		let task = await Tasks.findOne({_id})
		task = task._doc

		req.body.totalAmount = calculateTotal(req.body)

		if(
			task.addedBy != req.user.id && 
			!(task._membersAssigned ?? []).includes(String(req.user.id)) && 
			!adminIDs.includes(req.user.id) && 
			!req.permissions.page.includes("Payments W")
		) {
			res.status(401).send("Unauthorized to update this task")
			return
		}

		let _ = await Tasks.updateOne(
			{
				_id
			},
			{
				...req.body,
				docs:null,
				files:null,
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, taskID)
		}
		res.send("OK")
	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

module.exports = router