const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Quotations} = require("../models/Quotations");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');

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
		quotationID,
		addedBy: req.user.id
	});
	_ = await updateID("quotation")

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, quotationID)
	}
	res.send("OK")
})

router.get("/api/quotations/search", async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = {
			$and:[
				{
					$or:[
						{ quotationID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ relatedProject: { $regex: new RegExp(req.query.text) , $options:"i" }},
					]
				}
			],
		}

		let results = await Quotations.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		let userIds = results.map(val => val._doc.addedBy)

		userIds = await Members.find({_id: {$in: userIds}})
		
		results = results.map(val => {
			let user = userIds.find(v => String(v._id) == String(val.addedBy))
			return ({...val._doc, createdTime:val.createdTime.toISOString().split("T")[0], addedBy: user.userName})
		})

		res.json(results)
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
				...req.body
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


module.exports = router