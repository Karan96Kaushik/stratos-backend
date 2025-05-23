const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Packages} = require("../models/Packages");
const {Clients} = require("../models/Clients");
const {Payments} = require("../models/Payments");
const {generateExcel} = require("../modules/excelProcessor")
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');
const { serviceMapping, updatePackage, lastUpdatedMapping, mapFlags, formatDates } = require('../modules/packageHelpers');
const { handlePayment, updateClient } = require('../modules/paymentHelpers');
const { packageFields } = require('../statics/packageFields');
const {newPackageAssignedNotification, assignedPackageNotification} = require("../modules/notificationHelpers");
const _ = require('lodash')

router.post("/api/packages/add", async (req, res) => {
	try {
		if(!req.permissions.isAdmin && !req.permissions.page.includes("Packages W")) {
			res.status(401).send("Unauthorized")
			return
		}
	
		if(!req.body.archived)
			req.body.archived = false
	
		let packageID = "RT" + await getID("package")
		let package = await Packages.create({
			...req.body,
			packageID,
			addedBy: req.user.id
		});
		let _ = await updateID("package")
	
		res.send("OK")
		
		try {
			if(req.body.docs?.length) {
				let files = await saveFilesToLocal(req.body.docs)
				await uploadFiles(files, packageID)
			}
	
			await updatePackage(package)
		
			await updateClient(package.clientID)
		
			if(req.body._rmAssigned?.length)
				await newPackageAssignedNotification({
					...req.body,
					packageID,
					addedBy: req.user.id
				})
		}
		catch (err) {
			console.error("Error in upload files / update pkg / update client / notifications", err)
		}

	}
	catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

const generateQuery = (req) => {
	let others = {}

	let query = {
		$and:[
			{
				$or:[
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ packageID: { $regex: new RegExp(req.query.text) , $options:"i" }},
				],
				...others
			}
		],
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

		if(filter == "Form 5") {

			if(req.query.filters[filter]) 
				query['$and'].push({
					$or : [
						{ "Form 5": true },
						{ "Form 5": { $exists : true }}
					]
				})

			else
				query['$and'].push({
					$or : [
						{ "Form 5": false },
						{ "Form 5": { $exists : false }},
						// { "Form 5.0": { $exists : false }}
					]
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

	if (!req.permissions.isAdmin) {
		if(
			(req.query.services && !req.permissions.page.includes('Packages Services R')) || 
			(req.query.details && !req.permissions.page.includes('Packages R'))
		)
			query['$and'].push({
				$or:[
					{addedBy: req.user.id},
					{_rmAssigned: req.user.id},
				]
			})
	}

	return query
}

const commonProcessor = async (results) => {
	results = results.map(val => ({
			...val._doc, 
			...lastUpdatedMapping(val._doc, true)
		}))
		// Color code flags
		.map(mapFlags)
		// Date format

	const clientIDs = results.map(p => p.clientID)

	let clients = await Clients.find({clientID: {$in: clientIDs}})
	clients = clients.map(c => c._doc)

	results = results.map(v => ({
			...v,
			editFeesApplicable: v.editFeesApplicable ? v.editFeesApplicable : 'NA',
			editFeesApplicableColor: v.editFeesApplicable == 'No' ? null : 2,
			completionDate: clients.find(c => c.clientID == v.clientID)?.completionDate ? moment(new Date(clients.find(c => c.clientID == v.clientID)?.completionDate)).format("DD-MM-YYYY") : "",
			remarks: Array.isArray(v.remarks) ? v.remarks : [v.remarks],
			existingRemarks: Array.isArray(v.remarks) ? v.remarks : [v.remarks]
		}))
		.map(formatDates)

	return results
}

const mapPayments = async (results) => {
	let packageIDs = results.map(v => v.packageID)
	let payments = await Payments.find({
		packageID: {$in: packageIDs}
	})
	payments = payments.map(v => v._doc)

	// console.log(
	// 	payments, 
	// 	payments
	// 		.filter(v => results[0].packageID == v.packageID)
	// 		.reduce((t, curr) => t + Number(curr.receivedAmount),0)
	// )

	return results.map(val => ({
		...val, 
		receivedAmount: payments.filter(v => val.packageID == v.packageID).reduce((t, curr) => t + Number(curr.receivedAmount),0),
		payments: payments
			.filter(v => val.packageID == v.packageID)
			.map(v => (
				(v.paymentDate ? moment(new Date(v.paymentDate)).format("DD-MM-YYYY") + " - " : v.createdTime ? (moment(new Date(v.createdTime)).format("DD-MM-YYYY") + " - ") : " - ") +
				"₹" + v.receivedAmount + " - " +
				v.mode
			))
	}))
}

router.post("/api/packages/search", async (req, res) => {
	try{
		req.query = req.body

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		if (!req.permissions.isAdmin) {
			// if(req.query.services && !req.permissions.page.includes('Packages Services R'))
			// 	return res.status(401).send('Unauthorized to view services')
			// else if(req.query.details && !req.permissions.page.includes('Packages R'))
			// 	return res.status(401).send('Unauthorized to view details')
			if(req.query.accounts && !req.permissions.page.includes('Packages Accounts R'))
				return res.status(401).send('Unauthorized to view accounts')
		}

		let query = generateQuery(req)

		let results = await Packages.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = await commonProcessor(results)
		// console.log(results)
		if(req.query.accounts)
			results = await mapPayments(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

// Route to search packages while adding payments
router.get("/api/packages/payments/search", async (req, res) => {
	try {
		let results = await Packages.find(req.query).limit(5)
		results = results.map(v => v._doc)
		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/packages/export", async (req, res) => {
	try {
		req.query = req.body

		if (!req.permissions.isAdmin) {
			if(req.query.services && !req.permissions.page.includes('Packages Services R'))
				return res.status(401).send('Unauthorized to export services')
			else if(req.query.details && !req.permissions.page.includes('Packages R'))
				return res.status(401).send('Unauthorized to export details')
			else if(req.query.accounts && !req.permissions.page.includes('Packages Accounts R'))
				return res.status(401).send('Unauthorized to export accounts')
		}

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Packages.find(query)
			.collation({locale: "en" })

		results = await commonProcessor(results)
		if(req.query.accounts)
			results = await mapPayments(results)

		let file = await generateExcel(results, packageFields[req.query.accounts ? "accounts" : "all"], "packagesExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/packages/", async (req, res) => {
	try{

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Packages W") && !req.permissions.page.includes("Packages Services W")) {
			res.status(401).send("Unauthorized")
			return
		}
		
		delete req.query.service
		let package = await Packages.findOne(req.query);
		package = package._doc
		package = {...package, ...serviceMapping(package)}

		package.existingRemarks = package.remarks

		delete package.remarks

		if(new Date(package.startDate) + "" != "Invalid Date")
			package.startDate = new Date(package.startDate).toISOString().split("T")[0]

		let files = await getAllFiles(package.packageID + "/")
		files = files.map(({Key}) => (Key))

		package.files = files

		res.json(package)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/packages/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let _
		const _id = req.query._id

		let packageInfo = await Packages.findOne({_id});
		packageInfo = packageInfo._doc

		await Packages.deleteOne({_id});

		await updateClient(packageInfo.clientID)

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/packages/search/all", async (req, res) => {
	let query = req.query

	const packages = await Packages.find(query);

	res.json(packages)
})

router.post("/api/packages/update", async (req, res) => {
	try {

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Packages W") && !req.permissions.page.includes("Packages Services W")) {
			res.status(401).send("Unauthorized")
			return
		}

		let body = {...req.body.updateData}
		let original = {...req.body.originalData}
		let member = {...req.body.member}


		if (!body || !original)
			throw new Error('There was an issue in the update, please refresh the page and try again')

		let _id = body._id

		delete body._id
		delete body.memberID
		delete body.addedBy

		let package = await Packages.findOne({_id});
		let oldPackage = _.merge({}, package._doc)


		let newRemarks = []

		// Process new remark
		let remarks = ''
		if (body.remarks?.length > 0) {
			callMade = true
			remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + body.remarks
			if (member?.userName)
				remarks = remarks + ' - ' + member.userName
			newRemarks.push(remarks)
		}

		let existingRemarks = body.existingRemarks || original.existingRemarks


		if (Array.isArray(existingRemarks)) {
			delete body.remarks
		}
		else if (newRemarks.length) {
			body.remarks = newRemarks
		}

		delete body.existingRemarks

		await Packages.updateOne(
			{
				_id
			},
			{
				$set: { ...body },
				// $addToSet: addToSetData,
				$push: (newRemarks.length > 0 && Array.isArray(existingRemarks)) 
					? { remarks: { $each: newRemarks } } 
					: {}
			});

		res.send("OK")

		try {
			if(body.docs?.length) {
				let files = await saveFilesToLocal(body.docs)
				await uploadFiles(files, invoiceID)
			}

			package = {...package._doc, ...body}
			let newPackage = _.merge({}, package)
			
			await updatePackage(package)
	
			if(body._rmAssigned?.length || oldPackage._rmAssigned?.length)
				await assignedPackageNotification(newPackage, oldPackage)
		}
		catch (err) {
			console.error("Error in upload files / update packages / notifications", err)
		}

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router