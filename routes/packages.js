const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Packages} = require("../models/Packages");
const {generateExcel} = require("../modules/excelProcessor")
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');

router.post("/api/packages/add", async (req, res) => {
	// const memberInfo = await Members.findOne({_id: req.user.id})

	// if(!req.permissions.page.includes("Packages W")) {
	// 	res.status(401).send("Unauthorized")
	// 	return
	// }

    let packageID = "AC" + await getID("package")
	let _ = await Packages.create({
		...req.body,
		// memberID:memberInfo.memberID,
		packageID,
		addedBy: req.user.id
	});
	_ = await updateID("package")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, invoiceID)
	}
	res.send("OK")
})

const generateQuery = (req) => {
	let others = {}

	if(!req.permissions.page.includes("Payments R"))
		others.addedBy = req.user.id

	let query = {
		$and:[
			{
				$or:[
					{ invoiceID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
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

	// console.log(JSON.stringify(query, null, 4))

	return query
}

const commonProcessor = (results) => {
	// console.log(JSON.stringify(results, null, 4))
	results = results.map(val => ({
		...val._doc, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		paymentDate: val._doc.paymentDate ? moment(new Date(val._doc.paymentDate)).format("DD-MM-YYYY") : ""
		// a:console.log(val)
	}))
	return results
}

router.post("/api/packages/search", async (req, res) => {
	try{
		req.query = req.body

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Packages.find(query)
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

router.post("/api/packages/export", async (req, res) => {
	try{
		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Packages.find(query)
			.collation({locale: "en" })

		results = commonProcessor(results)

		let file = await generateExcel(results, paymentFields["all"], "packagesExport" + (+new Date))

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
		const _id = req.query._id
		delete req.query._id
		let invoices = await Packages.findOne({_id});
		invoices = invoices._doc

		let files = await getAllFiles(invoices.invoiceID + "/")
		files = files.map(({Key}) => (Key))

		invoices.files = files

		res.json(invoices)
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

		if(!req.permissions.page.includes("Packages W")) {
			res.status(401).send("Unauthorized")
			return
		}

		let _id = req.body._id

		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		await handlePayment(req.body, _id)

		_ = await Packages.updateOne(
			{
				_id
			},
			{
				...req.body
			});

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