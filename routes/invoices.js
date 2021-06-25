const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Invoices} = require("../models/Invoices");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const checkInvoiceR = (req, res, next) => {
	if(req.permissions.page.includes("Invoices R"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkInvoiceW = (req, res, next) => {
	console.log(req.permissions)
	if(req.permissions.page.includes("Invoices W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/invoices/add", checkInvoiceW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})
    console.log(memberInfo.memberID)
	let _ = await Invoices.create({
		...req.body,
		memberID:memberInfo.memberID,
		invoiceID:"IN" + await getID("invoice"),
		addedBy: req.user.id
	});
	_ = await updateID("invoice")
	res.send("OK")
})

router.get("/api/invoices/search", async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1

		if(req.query.text)
			others[req.query.type] = req.query.text;

		if(!req.permissions.page.includes("Invoices R"))
			others.addedBy = req.user.id
        // console.log(others)
		const invoices = await Invoices.find({...others}).limit(rowsPerPage).skip(rowsPerPage * page);
		res.json(invoices)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/invoices/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		const invoices = await Invoices.findOne({_id});
		// console.log(clients)
		res.json(invoices)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/invoices/update", checkInvoiceW, async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body._id
		delete req.body.invoiceID
		delete req.body.memberID
		delete req.body.addedBy

		let _ = await Invoices.updateOne(
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