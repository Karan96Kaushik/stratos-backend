const fs = require('fs');
const crypto = require("crypto");
const moment = require("moment");
const mongoose = require("mongoose");
const router     = new (require('express')).Router()

const {Notifications} = require("../models/Notifications");

router.get("/api/notifications", async (req, res) => {
	try {
		let _;

		let data = await Notifications.find({
			_memberID: req.query.mid
		})
			.collation({locale: "en" })
			.limit(25)
			// .skip(rowsPerPage * page)
			.sort({"createdTime": -1});

		let notifications = data.map(d => d._doc)

		res.status(200).json({
			notifications
		})
	} catch (err) {
		res.status(500).send(err.message)
	}
})

module.exports = router