const router     = new (require('express')).Router()
const moment = require("moment");
const {Invoices} = require("../models/Invoices");
const {Tasks} = require("../models/Tasks");
const {Members} = require("../models/Members");
const {Clients} = require("../models/Clients");
const {getID, updateID} = require("../models/Utils");
const fs = require('fs');

router.get("/api/dashboard/", async (req, res) => {
	try{

		let others = {}

		let query = {
			$or:[
				{ addedBy: req.user.id},
				{ _memberID: req.user.id},
			]
		}

		let results = await Tasks.find(query)

		results = results.map(val => val._doc)

		let added = results.filter(val => String(val.addedBy) == String(req.user.id))
		let assigned = results.filter(val => String(val._memberID) == String(req.user.id))
		let taskStatus = {}

		assigned.forEach(val => {
			taskStatus[val.status ?? "Unknown"] = (taskStatus[val.status ?? "Unknown"] ?? 0) + 1
		})

		query = {
			$or:[
				{ addedBy: req.user.id},
			]
		}

		results = await Clients.find(query)

		res.json({
			added: added.length, 
			assigned: assigned.length,
			taskStatus,
			addedClients: results.length
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router