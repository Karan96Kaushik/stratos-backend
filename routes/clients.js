const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Clients} = require("../models/Clients");

router.post("/api/clients/add", async (req, res) => {
	const _ = await Clients.create({...req.body, addedBy: req.user.id});
	res.send("OK")
})

router.get("/api/clients/", async (req, res) => {
	try{
		console.log(req.query)
		const clients = await Clients.find({...req.query, addedBy: req.user.id});
		console.log(clients)
		res.json(clients)
	} catch (err) {
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