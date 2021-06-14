const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Leads} = require("../models/Leads");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const checkLeadR = (req, res, next) => {
	if(req.permissions.page.includes("leadsr"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkLeadW = (req, res, next) => {
	// console.log(req.permissions)
	if(req.permissions.page.includes("leadsw"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/leads/add", checkLeadW, async (req, res) => {
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

		console.log(req.permissions.page)

		if(!req.permissions.page.includes("leadsr"))
			others.addedBy = req.user.id

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

router.post("/api/leads/update", checkLeadW, async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body._id
		delete req.body.leadID
		delete req.body.leadType
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