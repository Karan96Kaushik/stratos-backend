const moment = require("moment");
const router     = new (require('express')).Router()

const { Notifications } = require("../models/Notifications");
const client = require('../scripts/redisClient');
const { Members } = require("../models/Members");

router.get("/api/notifications", async (req, res) => {
	try {
		let _;

		const lastNotif = await getLastNotificationTime(req.query.mid)
		// console.debug(new Date(lastNotif),new Date,  (!lastNotif || lastNotif < (+new Date - 20000)), 'last notif', (+new Date - lastNotif)/1000, "secs")
		if ( req.query.useCached == 'true' && (!lastNotif || lastNotif < (+new Date - 20000)) )
			return res.status(304).json({notifications:[]})
		
		let data = await Notifications.find({
			_memberID: req.query.mid
		})
			.collation({locale: "en" })
			.limit(25)
			// .skip(rowsPerPage * page)
			.sort({"createdTime": -1});

		let notifications = data.map(d => d._doc)

		let unread = await Members.findOne({ _id: req.query.mid })

		res.status(200).json({
			notifications,
			unread: unread?._doc?.unread
		})
	} catch (err) {
		console.error(err)
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