const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Clients} = require("../models/Clients");
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const fs = require('fs');

const tmpdir = "/tmp/"

const checkR = (req, res, next) => {
	const isPermitted = req.permissions.page.includes("Clients R")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkW = (req, res, next) => {
	const isPermitted = req.permissions.page.includes("Clients W")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

router.post("/api/clients/add", checkW, async (req, res) => {
	try {

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

		let clientID = "CL" + await getID("client")
		let _ = await Clients.create({
			...req.body,
			clientID,
			addedBy: req.user.id
		});
		_ = await updateID("client")

		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(clientID + "/" + file.name, file.path)
				fs.unlink(file.path, () => {})
			}))
		}
		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send()
	}
})

router.get("/api/clients/search", async (req, res) => {
	try{

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage ?? 10)
		const page = parseInt(req.query.page ?? 1)-1
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)

		if(!req.query.clientType && !req.query.searchAll) {
			res.send()
			return
		}

		let query = {
			$and:[
				{
					$or:[
						{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ location: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ userID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ clientID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					]
				}
			],
		}

		if(!req.query.searchAll) {
			query['$and'].push({
				clientType: req.query.clientType
			})
		}

		if(!checkR(req))
			query['$and'].push({
				addedBy : req.user.id
			})
			
		let results = await Clients.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});
		results = results.map(val => ({...val._doc, createdTime: moment(new Date(val.createdTime)).format("DD-MM-YYYY")}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


router.get("/api/clients/", async (req, res) => {
	try{

		let query = req.query
		if(!checkR(req))
			query.addedBy = req.user.id

		const clients = await Clients.findOne(req.query);
		if(!clients){
			res.status(404).send("Client not found")
		}

		let files = await getAllFiles(clients.clientID + "/")

		files = files.map(f => f.Key)
		res.json({...clients._doc, files})
		
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/clients/", checkW, async (req, res) => {
	try{
		const _id = req.query._id
		const clients = await Clients.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/clients/update", checkW, async (req, res) => {
	try {
		let _id = req.body._id

		let clientID = req.body.clientID

		delete req.body._id
		delete req.body.clientID
		delete req.body.clientType
		delete req.body.addedBy

		// console.time("Uploading")
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
			console.log(files)

		}

		let _ = await Clients.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		// console.time("S3")
		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(clientID + "/" + file.name, file.path)
				fs.unlink(file.path, () => {})
			}))
		}
		// console.timeEnd("S3")
		// console.timeEnd("Uploading")

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router