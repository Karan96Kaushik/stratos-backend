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
const { packageFields } = require('../statics/packageFields');

router.post("/api/packages/add", async (req, res) => {

	if(!req.permissions.isAdmin && !req.permissions.page.includes("Packages W")) {
		res.status(401).send("Unauthorized")
		return
	}

    let packageID = "RT" + await getID("package")
	let package = await Packages.create({
		...req.body,
		packageID,
		addedBy: req.user.id
	});
	let _ = await updateID("package")

	await updatePackage(package)

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, packageID)
	}
	res.send("OK")
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

	// console.log(JSON.stringify(query, null, 4))

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
			completionDate: clients.find(c => c.clientID == v.clientID)?.completionDate ?? ""
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
			if(req.query.services && !req.permissions.page.includes('Packages Services R'))
				return res.status(401).send('Unauthorized to view services')
			else if(req.query.details && !req.permissions.page.includes('Packages R'))
				return res.status(401).send('Unauthorized to view details')
			else if(req.query.accounts && !req.permissions.page.includes('Packages Accounts R'))
				return res.status(401).send('Unauthorized to view accounts')
		}

		let query = generateQuery(req)

		let results = await Packages.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = await commonProcessor(results)
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

		if(new Date(package.startDate) + "" != "Invalid Date")
			package.startDate = new Date(package.startDate).toISOString().split("T")[0]

		let files = await getAllFiles(package.invoiceID + "/")
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

		await Packages.deleteOne({_id});

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

		let _id = req.body._id

		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		_ = await Packages.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		let package = await Packages.findOne({_id});
		
		_ = await updatePackage(package._doc)

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, invoiceID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router