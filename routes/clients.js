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
		// console.log(req.query)
		const clients = await Clients.find({...req.query, addedBy: req.user.id});
		// console.log(clients)
		res.json(clients)
	} catch (err) {
		res.status(500).send(err.message)
	}
})

module.exports = router