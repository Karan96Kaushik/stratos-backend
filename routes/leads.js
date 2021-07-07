const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Leads} = require("../models/Leads");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const checkLeadR = (req, res, next) => {
	if(req.permissions.page.includes("Leads R"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkLeadW = (req, res, next) => {
	// console.log(req.permissions)
	if(req.permissions.page.includes("Leads W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/leads/add", checkLeadW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})
	let leadIdPrefix = ""

	switch (req.body.leadType) {
		case ("developer"):
			leadIdPrefix = "LD"
			break;
		case ("litigation"):
			leadIdPrefix = "LL"
			break;
		case ("agent"):
			leadIdPrefix = "LA"
			break;
	}
	let _ = await Leads.create({
		...req.body,
		memberID:memberInfo.memberID,
		leadID:leadIdPrefix + await getID(leadIdPrefix),
		addedBy: req.user.id
	});
	_ = await updateID("lead")
	res.send("OK")
})

router.get("/api/leads/search", checkLeadR, async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1

		if(!req.query.leadType && !req.query.searchAll) {
			res.send()
			return
		}

		let query = {
			$and:[
				{
					$or:[
						{ leadID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					]
				}
			],
		}

		if(!req.query.searchAll) {
			query['$and'].push({
				leadType: req.query.leadType
			})
		}
		
		let results = await Leads.find(query)
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({createdTime:-1});

		results = results.map(val => ({...val._doc, createdTime:val.createdTime.toISOString().split("T")[0]}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/leads/", checkLeadR, async (req, res) => {
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

router.delete("/api/leads/", checkLeadW, async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		await Leads.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
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