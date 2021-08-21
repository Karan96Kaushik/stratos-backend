const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Payments} = require("../models/Payments");Payments
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');

router.post("/api/payments/add", async (req, res) => {
	// const memberInfo = await Members.findOne({_id: req.user.id})

	if(!req.permissions.page.includes("Payments W")) {
		res.status(401).send("Unauthorized")
		return
	}

    let paymentID = "AC" + await getID("account")
	let _ = await Payments.create({
		...req.body,
		// memberID:memberInfo.memberID,
		paymentID,
		addedBy: req.user.id
	});
	_ = await updateID("account")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, invoiceID)
	}
	res.send("OK")
})

router.get("/api/payments/search", async (req, res) => {
	try{

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

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
					],
					...others
				}
			],
		}

		let results = await Payments.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => ({...val._doc, createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/payments/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		let invoices = await Payments.findOne({_id});
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

router.delete("/api/payments/", async (req, res) => {
	try{
		const _id = req.query._id
		await Payments.deleteOne({_id});

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

router.post("/api/payments/update", async (req, res) => {
	try {

		if(!req.permissions.page.includes("Payments W")) {
			res.status(401).send("Unauthorized")
			return
		}

		let _id = req.body._id
		let invoiceID = req.body.invoiceID

		delete req.body.invoiceID
		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		let _ = await Payments.updateOne(
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