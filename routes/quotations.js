const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Quotations} = require("../models/Quotations");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");
const {quotationFields} = require("../statics/quotationFields")
const {generateExcel} = require("../modules/excelProcessor")
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');
const _ = require('lodash');
const crypto = require('crypto');
const { QueryGenerator } = require("../modules/QueryGenerator")

const checkQuotationR = (req, res, next) => {
	if(req.permissions.page.includes("Quotations R"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkQuotationW = (req, res, next) => {
	console.log(req.permissions)
	if(req.permissions.page.includes("Quotations W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/quotations/add", checkQuotationW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})
    console.log(memberInfo.memberID)

    let quotationID = "REQ" + await getID("quotation")
	let _ = await Quotations.create({
		...req.body,
		memberID:memberInfo.memberID,
		memberName:memberInfo.userName,
		quotationID,
		addedBy: req.user.id,
		serviceType: JSON.stringify(req.body.serviceType ?? [])
	});
	_ = await updateID("quotation")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, quotationID)
	}
	res.send("OK")
})

const generateQuery = (req) => {

	let queryGen = new QueryGenerator(req, "Quotations", {debug:false})

	queryGen.applyFilters()
	queryGen.setAddedBy("Quotations R")

	return queryGen.query
}

const commonProcessor = async (results) => {

	results = results.map(val => {
		// let user = userIds.find(v => String(v._id) == String(val.addedBy))
		let serviceType = _.attempt(JSON.parse.bind(null, val.serviceType))

		return ({
			...val._doc, 
			createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"), 
			// addedBy: user.userName,
			// memberID: user.memberID,
			// memberName: user.userName,
			serviceType: serviceType.join(", ")
		})
	})

	return results
}

router.post("/api/quotations/search", async (req, res) => {
	try{

		req.query = req.body

		let query = generateQuery(req)

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let results = await Quotations.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = await commonProcessor(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/quotations/export", async (req, res) => {
	try{

		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Quotations.find(query)
			.collation({locale: "en" })

		results = await commonProcessor(results)

		let file = await generateExcel(results, quotationFields["all"], "quotationsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/quotations/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		let quotations = await Quotations.findOne({_id});
		quotations = quotations._doc
		quotations.serviceType = JSON.parse(quotations.serviceType)

		let files = await getAllFiles(quotations.quotationID + "/")
		files = files.map(({Key}) => (Key))

		quotations.files = files

		res.json(quotations)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/quotations/update", checkQuotationW, async (req, res) => {
	try {
		let _id = req.body._id
		let quotationID = req.body.quotationID

		delete req.body._id
		delete req.body.quotationID
		delete req.body.memberID
		delete req.body.addedBy

		let _ = await Quotations.updateOne(
			{
				_id
			},
			{
				...req.body,
				serviceType: JSON.stringify(req.body.serviceType ?? [])
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, quotationID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/quotations/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		const _id = req.query._id
		const _ = await Quotations.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router