const fs = require('fs');
const crypto = require("crypto");
const mongoose = require("mongoose");
const router     = new (require('express')).Router()

const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils")

const {generateExcel} = require("../modules/excelProcessor");
const {memberFields} = require("../statics/memberFields");
const {encodeAuth, decodeAuth} = require("../modules/authCodec")
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const tmpdir = "/tmp/"

const checkR = (req, res, next) => {
	const isPermitted = req.permissions.isAdmin || req.permissions.page.includes("Members R")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkW = (req, res, next) => {
	const isPermitted = req.permissions.isAdmin || req.permissions.page.includes("Members W")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

router.post("/api/members/add", checkW, async (req, res) => {
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

		let memberID = "MI" + await getID("member")
		_ = await Members.create({
			...req.body,
			memberID,
			addedBy: req.user.id, 
			permissions
		});
		_ = await updateID("member")

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, memberID)
		}

		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

const generateQuery = (req) => {

	let others = {}

	let query = {
		$and:[
			{
				$or:[
					{ email: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ userName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	return query
}

router.get("/api/members/search", checkR, async (req, res) => {
	try {

		let query = generateQuery(req)

		let members = await Members.find(query);
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

router.get("/api/members/list", async (req, res) => {
	try {
		let members = await Members.find({...req.query});

		members = members.map((val) => ({
			_id: val._id,
			memberID: val.memberID,
			userName: val.userName,
		}))

		res.json(members)

	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
	
})

router.get("/api/members/export", checkR, async (req, res) => {
	try {

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)
		
		let members = await Members.find(query);

		members = members.map((val) => {
			val.password = undefined
			const perms = Object.assign({}, decodeAuth(val.permissions))

			val._doc.permissions = decodeAuth(val.permissions)
			return val._doc
		})

		let file = await generateExcel(members, memberFields, "membersExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
	
})

router.get("/api/members/", async (req, res) => {
	try {
		let members = await Members.findOne({...req.query});
		members = members._doc
		
		members.password = undefined
		const perms = Object.assign({}, decodeAuth(members.permissions))

		members.permissions = decodeAuth(members.permissions)

		let files = await getAllFiles(members.memberID + "/")

		files = files.map(({Key}) => (Key))
		// console.log({...members._doc, files})
		members.files = files
		res.json(members)

	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
	
})

router.delete("/api/members/", async (req, res) => {
	try {

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		let members = await Members.deleteOne({...req.query});
		res.send("OK")

	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
	
})

router.post("/api/members/update", checkW, async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body.email
		delete req.body._id
		let memberID = req.body.memberID

		if(req.body.password?.length) {
			req.body.password = crypto.createHmac('sha256', "someSalt")
				.update(req.body.password)
				.digest('hex')
		} else {
			delete req.body.password
		}

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

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, memberID)
		}

		res.send("OK")
	} catch (err) {
		// console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router