const moment = require("moment");
const router     = new (require('express')).Router()

const {Notifications} = require("../models/Notifications");
const client = require('../scripts/redisClient');

router.get("/api/notifications", async (req, res) => {
	try {
		let _;

		const lastNotif = await getLastNotificationTime(req.query.mid)
		if ( req.query.useCached && (!lastNotif || lastNotif < (+new Date - 10000)) )
			return res.status(304).send('ok')
		
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

const getLastNotificationTime = async (memberID) => {
    try {
        // console.debug(String(_memberID), String(ticketID))
        const msgTime = await client.hGet('NOTIF', String(memberID))
        return Number(msgTime)
    }
    catch (err) {
        console.error(err)
    }
}

module.exports = router