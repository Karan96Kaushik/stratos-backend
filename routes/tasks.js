const router     = new (require('express')).Router()
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {getID, updateID} = require("../models/Utils");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");

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

		if(!checkTaskPermission(req, req.body.serviceType)) {
			res.status(401).send("Unauthorized to create this task")
			return
		}

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
	let query = req.query

	if(!checkR(req))
		query.addedBy = req.user.id

	const tasks = await Tasks.findOne(query);
	let files = await getAllFiles(tasks.taskID + "/")

	files = files.map(f => f.Key)
	res.json({...tasks._doc, files})
})

router.delete("/api/tasks/", checkW, async (req, res) => {
	await Tasks.deleteOne({...req.query});
	res.send("ok")
})

router.post("/api/tasks/search", async (req, res) => {

	try {
		req.query = req.body

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)

		if(!req.query.serviceType && !req.query.searchAll) {
			res.send()
			return
		}

		if(!checkTaskPermission(req, req.query.serviceType)) {
			res.status(401).send("Unauthorized to view this task type")
			return
		}

		let query = {
			$and:[
				{
					$or:[
						{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
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

		if(!req.query.searchAll) {
			query['$and'].push({
				serviceType: req.query.serviceType
			})
		}

		if(!checkR(req))
			query['$and'].push({
				addedBy: req.user.id
			})
		
		let results = await Tasks.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => ({...val._doc, createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))

		res.json(results)
	}
	catch (err) {
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

router.post("/api/tasks/payments/search", async (req, res) => {

	req.query = req.body
	
	let others = {}
	const rowsPerPage = parseInt(req.query.rowsPerPage)
	const page = parseInt(req.query.page)-1
	const sortID = req.query.sortID
	const sortDir = parseInt(req.query.sortDir)

	if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
		res.status(401).send("Unauthorized access")
		return
	}

	let query = {
		$and:[
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
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
	
	let results = await Tasks.find(query)
		.collation({locale: "en" })
		.limit(rowsPerPage)
		.skip(rowsPerPage * page)
		.sort({[sortID || "createdTime"]: sortDir || -1});

	let taskIDs = results.map(val => (val.taskID))
	taskIDs = await Payments.find({
		taskID: {$in:taskIDs}
	})

	results = results.map(val => ({...val._doc, payments: taskIDs.filter((v) => (val.taskID == v.taskID))}))
	results = results.map(val => ({...val, received: val.payments.reduce((tot, curr) => ((Number(curr._doc.receivedAmount) ?? 0) + tot),0)}))
	results = results.map(val => ({...val, createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))
	results = results.map(val => ({...val, total: calculateTotal(val)}))
	results = results.map(val => ({...val, balance: val.total - val.received}))

	res.json(results)
})

router.get("/api/tasks/search/all", async (req, res) => {
	let query = req.query

	const tasks = await Tasks.find(query);

	res.json(tasks)
})

router.get("/api/tasks/payments/search/add", async (req, res) => {
	try {
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

router.post("/api/tasks/update", checkW, async (req, res) => {
	try {
		let _id = req.body._id
		let taskID = req.body.taskID

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

module.exports = router