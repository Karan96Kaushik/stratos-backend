const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {Members} = require("../models/Members");
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const {Packages} = require("../models/Packages");
const {paymentFields} = require("../statics/paymentFields")
const {generateExcel} = require("../modules/excelProcessor")
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');
const {handlePayment} = require("../modules/paymentHelpers")

// Route to add payemnts for tasks and packages
router.post("/api/payments/add", async (req, res) => {

	if(req.body.taskID && !req.permissions.isAdmin && !req.permissions.page.includes("Payments W")) {
		res.status(401).send("Unauthorized to add payments for tasks")
		return
	} 
	else if(req.body.packageID && !req.permissions.isAdmin && !req.permissions.page.includes("Packages Accounts W")) {
		res.status(401).send("Unauthorized to add payments for packages")
		return
	}

    let paymentID = "AC" + await getID("account")
	let _ = await Payments.create({
		...req.body,
		paymentID,
		addedBy: req.user.id
	});

	await handlePayment(req.body, null)

	_ = await updateID("account")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, invoiceID)
	}
	res.send("OK")
})

const generateQuery = (req) => {
	let others = {}

	if(!req.permissions.isAdmin && !req.permissions.page.includes("Payments R") && !req.permissions.page.includes("Packages Accounts R"))
		others.addedBy = req.user.id

	let query = {
		$and:[
			{
				$or:[
					{ invoiceID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ packageID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ remarks: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ receivedAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
				],
				...others
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

const commonProcessor = (results) => {
	results = results.map(val => ({
		...val._doc, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		paymentDate: val._doc.paymentDate ? moment(new Date(val._doc.paymentDate)).format("DD-MM-YYYY") : "",
		taskID: val._doc.taskID ?? val._doc.packageID,
	}))
	return results
}

router.post("/api/payments/search", async (req, res) => {
	try{
		req.query = req.body

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Payments R")) {
			res.status(401).send("Unauthorized")
			return
		}

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Payments.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = commonProcessor(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/payments/export", async (req, res) => {
	try{
		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Payments.find(query)
			.collation({locale: "en" })

		results = commonProcessor(results)

		let file = await generateExcel(results, paymentFields["all"], "paymentsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/payments/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		let payments = await Payments.findOne({_id});
		payments = payments._doc

		let files = await getAllFiles(payments.invoiceID + "/")
		files = files.map(({Key}) => (Key))

		payments.files = files

		res.json(payments)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/payments/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let _
		const _id = req.query._id

		let paymentInfo = await Payments.findOne({_id});
		if (!paymentInfo)
			throw new Error("Original payment corrupted")

		await Payments.deleteOne({_id});

		await handlePayment(paymentInfo._doc)

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/payments/search/all", async (req, res) => {
	let query = req.query

	const payments = await Payments.find(query);

	res.json(payments)
})

const calculateTotal = (val) => (
	Number(val.billAmount ?? 0) +
	Number(val.gst ?? 0) +
	Number(val.govtFees ?? 0) +
	Number(val.sroFees ?? 0)
)

router.post("/api/payments/update", async (req, res) => {
	try {

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Payments W")) {
			res.status(401).send("Unauthorized")
			return
		}

		let _id = req.body._id

		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		_ = await Payments.updateOne(
			{
				_id
			},
			{
				...req.body
			});
		
		await handlePayment(req.body, _id)

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