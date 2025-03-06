const router     = new (require('express')).Router()
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {getID, updateID} = require("../models/Utils");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const {generateExcel} = require("../modules/excelProcessor");
const {taskFields, taskPayments} = require("../statics/taskFields");
const {handlePayment, calculateTotal} = require("../modules/paymentHelpers");
const {newTaskAssignedNotification, assignedTaskNotification} = require("../modules/notificationHelpers");
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
    "Change of Promoter": "CP",
    "Project Closure": "PC",
    "De-Registration": "DR",
    "Order No 40": "ON",
}

const checkR = (req, res, next) => {
	let isPermitted

	if(req.permissions.isAdmin)
		isPermitted = true
	else
		isPermitted = req.permissions.page.includes("Tasks R")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkW = (req, res, next) => {
	let isPermitted

	if(req.permissions.isAdmin)
		isPermitted = true
	else
		isPermitted = req.permissions.page.includes("Tasks W")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkTaskPermission = (req, taskType) => {
	if (Array.isArray(taskType)) {
		taskType = taskType.filter(s => !['Legal', 'Technical'].includes(s))
		// console.log(taskType.find(s => !req.permissions.service.includes(s)))
		return !taskType.find(s => !req.permissions.service.includes(s))
	}
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

		// Certain tasks don't have to be billed
		if(!req.body.removeFromAccounts)
			req.body.removeFromAccounts = false

		req.body.totalAmount = calculateTotal(req.body)
		req.body.balanceAmount = req.body.totalAmount

		const member = await Members.findOne({_id: req.user.id})

		let newRemarks = []
		let remarks = ''
		if (req.body.remarks?.length > 0) {
			remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + req.body.remarks
			if (member?.userName)
				remarks = remarks + ' - ' + member.userName
			newRemarks.push(remarks)
		}

		req.body.remarks = newRemarks

		let taskID = serviceCode + await getID(serviceCode)
		_ = await Tasks.create({
			...req.body,
			taskID,
			docs:null,
			files:null,
			addedBy: req.user.id,
			addedByName: member.userName
		});
		_ = await updateID(serviceCode)

		res.send("OK")

		try {
			if(req.body._membersAssigned?.length || req.body._membersAllocated?.length)
				await newTaskAssignedNotification({
					...req.body,
					taskID,
					docs:null,
					files:null,
					addedBy: req.user.id
				})
	
			if(req.body.docs?.length) {
				let files = await saveFilesToLocal(req.body.docs)
				await uploadFiles(files, taskID)
			}
		}
		catch (err) {
			console.error("Error in upload files or notifications", err)
		}
	} catch (err) {
		console.error(err)
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

	let tasks = await Tasks.findOne(query);
	let files = await getAllFiles(tasks.taskID + "/")

	tasks = tasks._doc
	tasks.existingRemarks = tasks.remarks
	tasks.existingPaymentRemarks = tasks.paymentRemarks

	if (!Array.isArray(tasks.existingRemarks)) {
		tasks.existingRemarks = [tasks.existingRemarks]
	}

	if (!Array.isArray(tasks.existingPaymentRemarks)) {
		tasks.existingPaymentRemarks = [tasks.existingPaymentRemarks]
	}

	delete tasks.remarks
	delete tasks.paymentRemarks

	files = files.map(f => f.Key)
	res.json({...tasks, files})
})

router.delete("/api/tasks/", checkW, async (req, res) => {

	if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
		res.status(401).send("Incorrect password")
		return
	}
	delete req.query.password
	
	let task = await Tasks.findOne({_id: req.query._id})

	if(!req.permissions.isAdmin && task.addedBy != req.user.id) {
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
				{ membersAllocated: { $regex: new RegExp(req.query.text) , $options:"i" }},
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
	else
		delete req.query.text

	if(req.query.text && !isNaN(Number(req.query.text))) {

		query.$and[0].$or.push(
			{ totalAmount: Number(req.query.text)}
		)

	}

	// search only the tasks that are permitted
	if(!req.query.serviceType && !req.permissions.isAdmin)
		query['$and'].push({'$or':
			req.permissions.service.map((svc) => ({
				serviceType: svc
			}))
		})

	// search only the non-archived tasks if not specified exclusively
	if(req.query.filters.onlyarchived)
		query['$and'].push({
			archived:true
		})
	else if(!req.query.filters.archived)
		query['$and'].push({
			archived:false
		})
	delete req.query.filters.archived
	delete req.query.filters.onlyarchived

	// search only the removed from accounts tasks if not specified exclusively
	if(req.query.filters.onlyremovedfromaccounts)
		query['$and'].push({
			removeFromAccounts:true
		})
	delete req.query.filters.onlyremovedfromaccounts

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
				{_membersAllocated: req.user.id},
			]
		})

	if(!query['$and'].length) {
		delete query['$and']
	}
	
	// console.log(JSON.stringify(query, null, 4))

	return query
}

const commonProcessor = (results) => {

	results = results.map(val => ({
		...val._doc, 
		asOnDate: val._doc.asOnDate ? moment(new Date(val._doc.asOnDate)).format("DD-MM-YYYY") : '',
		deadline: val._doc.deadline ? moment(new Date(val._doc.deadline)).format("DD-MM-YYYY") : '',
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followupDate: val._doc.followupDate ? moment(new Date(val._doc.followupDate)).format("DD-MM-YYYY") : '-',
		paymentDate: val._doc.paymentDate ? moment(new Date(val._doc.paymentDate)).format("DD-MM-YYYY") : '-',
		remarks: val._doc.remarks || [],
		// paymentRemarks: val._doc.paymentRemarks || [],
		paymentRemarks: typeof(val._doc.paymentRemarks) == 'string' ? Array(val._doc.paymentRemarks) : val._doc.paymentRemarks,
		billAmount: undefined,
		gst: undefined,
		govtFees: undefined,
		sroFees: undefined
	}))

	// Confirmation Date duration color coding
	results = results.map(val => {
		if (!val.confirmationDate) return val

		let confirmationDateColor = +new Date(val.confirmationDate) - +new Date()

		if(confirmationDateColor > 1000*60*60*24*14) 	// 14 days passed
			confirmationDateColor = 2
		else if(confirmationDateColor > 1000*60*60*24*7) 	// 7 days passed
			confirmationDateColor = 1 					// Yellow
		else 											// more than 3 days
			confirmationDateColor = null

		return ({...val, confirmationDateColor})
	})

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

		if(!req.permissions.isAdmin)
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

		if(req.query.password != (process.env.ExportPassword ?? "exp")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Tasks.find(query)
			.collation({locale: "en" })

		results = commonProcessor(results)

		let fields = taskFields["all"]

		if (req.query.serviceType?.length) {
			req.query.serviceType.forEach(f => {
				taskFields[f].texts.forEach(fl => !fields.texts.find(a => a.id == fl.id) ? fields.texts.push(fl) : false)
				taskFields[f].checkboxes.forEach(fl => !fields.checkboxes.find(a => a.id == fl.id) ? fields.checkboxes.push(fl) : false)
			})
		}

		let file = await generateExcel(results, fields, "tasksExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

const generateQueryPayments = async (req) => {

	let query = {$and : []}

	if(req.query.text)
		query.$and.push({
			$or:[
				{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
			]
		})
	else
		delete req.query.text


	if(!isNaN(Number(req.query.text))) {
		if (query.$and.length == 0) {
			query.$and.push({
				$or:[]
			})
		}
		
		query.$and[0].$or.push(
			{ receivedAmount: Number(req.query.text)},
			{ balanceAmount: Number(req.query.text)},
			{ totalAmount: Number(req.query.text)},
			{ billAmount: Number(req.query.text)},
		)

	}

	// search only the non-archived tasks if not specified exclusively
	if(req.query.filters.onlyarchived)
		query['$and'].push({
			archived:true
		})
	else if(!req.query.filters.archived)
		query['$and'].push({
			archived:false
		})
	delete req.query.filters.archived
	delete req.query.filters.onlyarchived

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
	if(!req.query.searchAll && req.query.serviceType?.length) {
		query['$and'].push({
			serviceType: req.query.serviceType
		})
	}

	// console.log(req.permissions.page.includes("Assigned Task Accounts R"), !req.permissions.page.includes("Payments R"))
	if (req.permissions.page.includes("Assigned Task Accounts R") && !req.permissions.page.includes("Payments R")) {
		query['$and'].push({$or: [
			{_membersAllocated: req.user.id},
			{_membersAssigned: req.user.id}
		]})
	}

	query.$and.push({ removeFromAccounts: false })

	if (!query.$and.length)
		delete query.$and

	// console.log(JSON.stringify(query, null, 4))

	return query

}

const commonProcessorPayments = async (results) => {
	let taskIDs = results.map(val => (val.taskID))
	taskIDs = await Payments.find({
		taskID: {$in:taskIDs}
	})

	results = results.map(val => ({...val._doc, payments: taskIDs.filter((v) => (val.taskID == v.taskID))}))
	results = results.map(val => ({...val, received: val.payments.reduce((tot, curr) => ((Number(curr._doc.receivedAmount) ?? 0) + tot),0)}))
	results = results.map(val => ({
		...val, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followupDate: val.followupDate ? moment(new Date(val.followupDate)).format("DD-MM-YYYY") : '-',
		paymentDate: val.paymentDate ? moment(new Date(val.paymentDate)).format("DD-MM-YYYY") : '-',
	}))
	results = results.map(val => ({...val, total: calculateTotal(val)}))
	results = results.map(val => ({...val, balance: val.total - val.received}))
	results = results.map(val => ({
		...val,
		paymentRemarks: typeof(val.paymentRemarks) == 'string' ? Array(val.paymentRemarks) : val.paymentRemarks,
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

router.post("/api/tasks/payments/search", async (req, res) => {

	req.query = req.body

	if(!req.permissions.isAdmin)
		if((!req.permissions.page.includes("Payments R") && !req.permissions.page.includes("Assigned Task Accounts R")) || !req.permissions.page.includes("Tasks R")) {
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

	if(req.query.password != (process.env.ExportPassword ?? "exp")) {
		res.status(401).send("Incorrect password")
		return
	}
	delete req.query.password

	if(!req.permissions.isAdmin)
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

		if(!req.permissions.isAdmin)
			if(!req.permissions.page.includes("Payments W") || (!req.permissions.page.includes("Tasks R") && !req.permissions.service.length)) {
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

		if( !req.permissions.service.includes(task.serviceType) && !req.permissions.page.includes("Tasks R") ) {
			res.status(401).send("Unauthorized access for service")
			return
		}

		res.json(task)

	} catch (err) {
		res.status(500).send(err.message)
	}

})

router.get("/api/clients/payments/search/add", async (req, res) => {
	try {

		if(!req.permissions.isAdmin)
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

		let body = {...req.body.updateData}
		let original = {...req.body.originalData}
		let member = {...req.body.member}

		if (!body || !original)
			throw new Error('There was an issue in the update, please refresh the page and try again')

		let _id = body._id
		let taskID = body.taskID

		delete body._id
		delete body.taskID
		delete body.serviceType
		delete body.clientID
		delete body._clientID
		delete body.clientName

		let task = await Tasks.findOne({_id})
		task = task._doc

		body.totalAmount = calculateTotal(body)

		if(
			!req.permissions.isAdmin && 
			task.addedBy != req.user.id && 
			!(task._membersAssigned ?? []).includes(String(req.user.id)) && 
			!(task._membersAllocated ?? []).includes(String(req.user.id)) && 
			!req.permissions.page.includes("Payments W")
		) {
			res.status(401).send("Unauthorized to update this task")
			return
		}


		let newRemarks = []

		// Process new remark
		let remarks = ''
		if (body.remarks?.length > 0) {
			remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + body.remarks
			if (member?.userName)
				remarks = remarks + ' - ' + member.userName
			newRemarks.push(remarks)
		}

		let newPaymentRemarks = []

		// Process new remark
		let paymentRemarks = ''
		if (body.paymentRemarks?.length > 0) {
			paymentRemarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + body.paymentRemarks
			if (member?.userName)
				paymentRemarks = paymentRemarks + ' - ' + member.userName
			newPaymentRemarks.push(paymentRemarks)
		}

		let existingRemarks = body.existingRemarks || original.existingRemarks
		let existingPaymentRemarks = body.existingPaymentRemarks || original.existingPaymentRemarks

		if (body.status && (body.status !== original.status)) {
			let updateRemark = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + 'Status updated to ' + body.status
			if (member?.userName)
				updateRemark = updateRemark + ' - ' + member.userName
			newRemarks.push(updateRemark)
		}

		if (Array.isArray(existingRemarks)) {
			delete body.remarks
		}
		else if (newRemarks.length) {
			body.remarks = newRemarks
		}


		if (Array.isArray(existingPaymentRemarks)) {
			delete body.paymentRemarks
		}
		else if (newPaymentRemarks.length) {
			body.paymentRemarks = newPaymentRemarks
		}

		delete body.existingRemarks
		delete body.existingPaymentRemarks

		let _ = await Tasks.updateOne(
			{
				_id
			},
			{
				$set: { 
					...body,
					docs: null,
					files: null,
				},
				$push: {
					...(newRemarks.length > 0 && Array.isArray(existingRemarks) 
						? { remarks: { $each: newRemarks } }
						: {}),
					...(newPaymentRemarks.length > 0 && Array.isArray(existingPaymentRemarks)
						? { paymentRemarks: { $each: newPaymentRemarks } }
						: {})
				}
			});

		if(body.docs?.length) {
			let files = await saveFilesToLocal(body.docs)
			await uploadFiles(files, taskID)
		}

		res.send("OK")

		try {
			if(body._membersAssigned?.length || task._membersAllocated?.length)
				await assignedTaskNotification({
					...body,
					docs:null,
					files:null,
				}, task)
			
			// console.log(task)
			await handlePayment(task)
		}
		catch (err) {
			console.error("Error in Handle Payment or Notifs", err)
		}

	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

module.exports = router