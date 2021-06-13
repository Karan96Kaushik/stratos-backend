const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Leads} = require("../models/Leads");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

router.post("/api/leads/add", async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})
	let _ = await Leads.create({
		...req.body,
		memberID:memberInfo.memberID,
		leadID:"LD" + await getID("lead"),
		addedBy: req.user.id
	});
	_ = await updateID("lead")
	res.send("OK")
})

router.get("/api/leads/search", async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1

		console.log(page, rowsPerPage)


		if(req.query.text)
			others[req.query.type] = req.query.text;

		const leads = await Leads.find({ leadType: req.query.leadType, ...others}).limit(rowsPerPage).skip(rowsPerPage * page);
		// console.log(clients)
		res.json(leads)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/leads/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		const leads = await Leads.findOne({_id});
		// console.log(clients)
		res.json(leads)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/leads/update", async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body._id
		delete req.body.leadID
		delete req.body.teadType
		delete req.body.memberID
		delete req.body.addedBy

		let _ = await Leads.updateOne(
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