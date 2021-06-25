const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Quotations} = require("../models/Quotations");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

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
	let _ = await Quotations.create({
		...req.body,
		memberID:memberInfo.memberID,
		quotationID:"QT" + await getID("quotation"),
		addedBy: req.user.id
	});
	_ = await updateID("quotation")
	res.send("OK")
})

router.get("/api/quotations/search", async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1

		if(req.query.text)
			others[req.query.type] = req.query.text;

		if(!req.permissions.page.includes("Quotations R"))
			others.addedBy = req.user.id
        // console.log(others)
		const quotations = await Quotations.find({...others}).limit(rowsPerPage).skip(rowsPerPage * page);
		res.json(quotations)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/quotations/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		const quotations = await Quotations.findOne({_id});
		// console.log(clients)
		res.json(quotations)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/quotations/update", checkQuotationW, async (req, res) => {
	try {
		let _id = req.body._id

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

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router