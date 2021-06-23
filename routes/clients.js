const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Clients} = require("../models/Clients");
const {getID, updateID} = require("../models/Utils");

router.post("/api/clients/add", async (req, res) => {
	let _ = await Clients.create({
		...req.body,
		clientID:"CL" + await getID("client"),
		addedBy: req.user.id
	});
	_ = await updateID("client")
	res.send("OK")
})

router.get("/api/clients/search", async (req, res) => {
	try{

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage ?? 10)
		const page = parseInt(req.query.page ?? 1)-1

		if(req.query.text)
			others[req.query.type] = req.query.text;
		if(req.query.clientType)
			others.clientType = req.query.clientType;
		if(req.query.clientType)
			others.clientType = req.query.clientType;

		// console.log(req.permissions.page)
		console.log(page, rowsPerPage)

		// if(!req.permissions.page.includes("leadsr"))
		// 	others.addedBy = req.user.id

		console.log(others)
		const results = await Clients.find({...others})
								.limit(rowsPerPage)
								.skip(rowsPerPage * page);

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/clients/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		const clients = await Clients.findOne({_id});
		// console.log(clients)
		res.json(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/clients/update", async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body._id
		delete req.body.clientID
		delete req.body.clientType
		delete req.body.addedBy

		let _ = await Clients.updateOne(
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