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
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const page = parseInt(req.query.page)-1

		if(req.query.text)
			others[req.query.type] = req.query.text;

		// console.log(req.permissions.page)

		// if(!req.permissions.page.includes("leadsr"))
		// 	others.addedBy = req.user.id

		const results = await Clients.find({ clientType: req.query.clientType, ...others})
								.limit(rowsPerPage)
								.skip(rowsPerPage * page);

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/clients/search", async (req, res) => {
	try{
		console.log(req.query)
		const clients = await Clients.find({addedBy: req.user.id});
		console.log(clients)
		res.json(clients)
	} catch (err) {
		res.status(500).send(err.message)
	}
})

module.exports = router