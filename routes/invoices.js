const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Invoices} = require("../models/Invoices");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');

const checkInvoiceR = (req, res, next) => {
	if(req.permissions.page.includes("Invoices R"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkInvoiceW = (req, res, next) => {
	// console.log(req.permissions)
	if(req.permissions.page.includes("Invoices W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/invoices/add", checkInvoiceW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})

    let invoiceID = "IN" + await getID("invoice")
	let _ = await Invoices.create({
		...req.body,
		memberID:memberInfo.memberID,
		invoiceID,
		addedBy: req.user.id
	});
	_ = await updateID("invoice")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, invoiceID)
	}
	res.send("OK")
})

router.get("/api/invoices/search", async (req, res) => {
	try{

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		if(!req.permissions.page.includes("Invoices R"))
			others.addedBy = req.user.id

		let query = {
			$and:[
				{
					$or:[
						{ invoiceID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					],
					...others
				}
			],
		}

		let results = await Invoices.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => ({...val._doc, createdTime:val.createdTime.toISOString().split("T")[0]}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/invoices/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		let invoices = await Invoices.findOne({_id});
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

router.post("/api/invoices/update", checkInvoiceW, async (req, res) => {
	try {
		let _id = req.body._id
		let invoiceID = req.body.invoiceID

		delete req.body.invoiceID
		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		let _ = await Invoices.updateOne(
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