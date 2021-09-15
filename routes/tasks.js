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
	// console.log(req.permissions, taskType)
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
	let task = await Tasks.findOne({_id})

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
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ memberName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ billAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	// search only the tasks that are permitted
	if(!req.query.serviceType)
		query['$and'].push({'$or':
			req.permissions.service.map((svc) => ({
				serviceType: svc
			}))
		})

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
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/tasks/export", async (req, res) => {
	try{
		req.query = req.body

		let password = crypto.createHmac('sha256', "someSalt")
			.update(req.query.password)
			.digest('hex')
		delete req.query.password

		let user = await Members.findOne({_id: req.user.id, password})
		if(!user) {
			res.status(401).send("Incorrect password")
			return
		}
		let query = generateQuery(req)

		let results = await Tasks.find(query)
			.collation({locale: "en" })

		results = commonProcessor(results)

		let file = await generateExcel(results, taskFields[req.query.searchAll ? "all" : req.query.serviceType], "tasksExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
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

	let query = {
		$and:[
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ billAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	// if(Number(req.query.text)) {
	// 	const taskIDs = await searchBillAmount(req.query.text)
	// 	query["$and"][0]["$or"].push({taskID: {"$in": taskIDs}})		
	// }

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

	// console.log(JSON.stringify(query, null, 4))
	
	let results = await Tasks.find(query)
		.collation({locale: "en" })
		.limit(rowsPerPage)
		.skip(rowsPerPage * page)
		.sort({[sortID || "createdTime"]: sortDir || -1});

	// console.log(results)

	results = await commonProcessorPayments(results)
	res.json(results)
})

router.post("/api/tasks/payments/export", async (req, res) => {

	req.query = req.body

	let password = crypto.createHmac('sha256', "someSalt")
		.update(req.query.password)
		.digest('hex')
	delete req.query.password

	let user = await Members.findOne({_id: req.user.id, password})
	if(!user) {
		res.status(401).send("Incorrect password")
		return
	}


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

		if(!task.clientID) {
			let client = await Clients.findOne({_id: task._clientID})
			task.clientID = client.clientID
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

		if(task.addedBy != req.user.id && task._memberID != req.user.id) {
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
		console.log(err)
		res.status(500).send(err.message)
	}
})

const generateQueryClientPayments = async (req) => {

	let query = {
		$and:[
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ billAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
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

	return query

}

const commonProcessorClientPayments = async (results) => {
	let taskIDs = results.map(val => (val.taskID))
	taskIDs = await Payments.find({
		taskID: {$in:taskIDs}
	})

	results = results.map(val => ({...val._doc, payments: taskIDs.filter((v) => (val.taskID == v.taskID))}))
	results = results.map(val => ({...val, received: val.payments.reduce((tot, curr) => ((Number(curr._doc.receivedAmount) ?? 0) + tot),0)}))
	results = results.map(val => ({...val, createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))
	results = results.map(val => ({...val, total: calculateTotal(val)}))
	results = results.map(val => ({...val, balance: val.total - val.received}))

	let clientResults = {}

	results.forEach(val => {
		if(!clientResults[val._clientID])
			clientResults[val._clientID] = []

		clientResults[val._clientID].push(val)
	})

	let clientInfo = await Clients.find({
		_id:{$in:Object.keys(clientResults)}
	})

	clientResults = Object.keys(clientResults).map(_client => ({
		...clientInfo.find(v => String(v._id) == String(_client))._doc,
		total: clientResults[_client].reduce((a,b) => (a+b.total), 0),
		balance: clientResults[_client].reduce((a,b) => (a+b.balance), 0),
		taskList: clientResults[_client].map(v=>v.taskID).join(", "),
		tasks: clientResults[_client]
	}))

	return clientResults
}

router.post("/api/clients/payments/search", async (req, res) => {

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

	let query = await generateQueryClientPayments(req)

	let results = await Tasks.find(query)
		.collation({locale: "en" })
		.limit(rowsPerPage)
		.skip(rowsPerPage * page)
		.sort({[sortID || "createdTime"]: sortDir || -1});

	results = await commonProcessorClientPayments(results)
	console.log(results)

	res.json(results)
})

module.exports = router