const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Members} = require("../models/Members");
const crypto = require("crypto");
const {encodeAuth, decodeAuth} = require("../modules/authCodec")
const {getID, updateID} = require("../models/Utils")

router.post("/api/members/add", async (req, res) => {
	try {
		let _;

		let data = await Members.findOne({email:req.body.email});

		if(data)
			throw new Error("Email ID Exists")

		req.body.password = crypto.createHmac('sha256', "someSalt")
			.update(req.body.password)
			.digest('hex')

		let permissions = [...(req.body.servicePermissions ?? []), ...(req.body.pagePermissions ?? [])]
		// permissions = permissions.map(val => val.toLowerCase())
		// permissions = permissions.map(val => val.replace(" ", ""))
		permissions = encodeAuth(permissions)

		_ = await Members.create({
			...req.body,
			memberID:"MI" + await getID("member"),
			addedBy: req.user.id, 
			permissions
		});
		_ = await updateID("member")

		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get("/api/members/", async (req, res) => {
	try {
		let members = await Members.find({...req.query});

		members = members.map((val) => {
			val.password = undefined
			const perms = Object.assign({}, decodeAuth(val.permissions))

			val._doc.permissions = decodeAuth(val.permissions)
			return val._doc
		})

		res.json(members)

	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
	
})

router.post("/api/members/update", async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body.email
		delete req.body.password
		delete req.body._id
		delete req.body.memberID

		let permissions = [...req.body.servicePermissions, ...req.body.pagePermissions]
		// permissions = permissions.map(val => val.toLowerCase())
		// permissions = permissions.map(val => val.replace(" ", ""))
		permissions = encodeAuth(permissions)

		let _ = await Members.updateOne(
			{
				_id
			},
			{
				...req.body, 
				permissions
			});

		res.send("OK")
	} catch (err) {
		// console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router