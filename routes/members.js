const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Members} = require("../models/Members");
const crypto = require("crypto");
const {encodeAuth, decodeAuth} = require("../modules/authCodec")
const {getID, updateID} = require("../models/Utils")
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const fs = require('fs');

const tmpdir = "/tmp/"

router.post("/api/members/add", async (req, res) => {
	try {
		let _;

		let data = await Members.findOne({email:req.body.email});

		if(data)
			throw new Error("Email ID Exists")

		let files
		if(req.body.docs?.length) {
			files = await Promise.all(req.body.docs.map(async (file) => new Promise((resolve, reject) => {
				file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
				file.name = parseInt(Math.random()*1000) + "_" + file.name

				let fileName = tmpdir + +new Date + "_" + file.name

				const fileContents = Buffer.from(file.data, 'base64')
				fs.writeFile( fileName, fileContents, 'base64', (err) => {
					console.log(err)
					if (err) reject(err)
					resolve({name:file.name,path:fileName})
				})
			})))
			// console.log(files)

		}

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

		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(memberID + "/" + file.name, file.path)
				fs.unlink(file.path, () => {})
			}))
		}

		res.send("OK")
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.get("/api/members/search", async (req, res) => {
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

router.post("/api/members/update", async (req, res) => {
	try {
		let _id = req.body._id

		delete req.body.email
		delete req.body._id
		let memberID = req.body.memberID

		let files
		if(req.body.docs?.length) {
			files = await Promise.all(req.body.docs.map(async (file) => new Promise((resolve, reject) => {
				file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
				file.name = parseInt(Math.random()*1000) + "_" + file.name

				let fileName = tmpdir + +new Date + "_" + file.name

				const fileContents = Buffer.from(file.data, 'base64')
				fs.writeFile( fileName, fileContents, 'base64', (err) => {
					console.log(err)
					if (err) reject(err)
					resolve({name:file.name,path:fileName})
				})
			})))
			// console.log(files)

		}

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

		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(clientID + "/" + file.name, file.path)
				fs.unlink(file.path, () => {})
			}))
		}

		res.send("OK")
	} catch (err) {
		// console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router