const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const {Leads} = require("../models/Leads");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const fs = require('fs');

const tmpdir = "/tmp/"

const checkLeadR = (req, res, next) => {
	if(req.permissions.page.includes("Leads R"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const checkLeadW = (req, res, next) => {
	// console.log(req.permissions)
	if(req.permissions.page.includes("Leads W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

router.post("/api/leads/add", checkLeadW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})

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

	let leadIdPrefix = ""

	switch (req.body.leadType) {
		case ("developer"):
			leadIdPrefix = "LD"
			break;
		case ("litigation"):
			leadIdPrefix = "LL"
			break;
		case ("agent"):
			leadIdPrefix = "LA"
			break;
	}

	let leadID = leadIdPrefix + await getID(leadIdPrefix)
	let _ = await Leads.create({
		...req.body,
		memberID:memberInfo.memberID,
		leadID,
		addedBy: req.user.id
	});
	_ = await updateID("lead")

	if(files?.length) {
		await Promise.all(files.map(async (file) => {
			await uploadToS3(leadID + "/" + file.name, file.path)
			fs.unlink(file.path, () => {})
		}))
	}
	res.send("OK")
})

router.get("/api/leads/search", async (req, res) => {
	try{
		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		if(!req.query.leadType && !req.query.searchAll) {
			res.send()
			return
		}

		let query = {
			$and:[
				{
					$or:[
						{ leadID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
						{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					]
				}
			],
		}

		if(!req.query.searchAll) {
			query['$and'].push({
				leadType: req.query.leadType
			})
		}

		if(!req.permissions.page.includes("Leads R")) {
			query['$and'].push({
				addedBy: req.user.id
			})
		}

		// console.log({[sortID || "createdTime"]: sortDir || -1})
		
		// console.time("Sorted leads")
		let results = await Leads.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});
		// console.timeEnd("Sorted leads")

		results = results.map(val => ({...val._doc, createdTime:val.createdTime.toISOString().split("T")[0]}))

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/leads/", async (req, res) => {
	try{
		const query = req.query

		if(!req.permissions.page.includes("Leads R")) {
			query.addedBy = req.user.id
		}

		const leads = await Leads.findOne({...query});

		let files = await getAllFiles(leads.leadID + "/")

		files = files.map(f => f.Key)
		res.json({...leads._doc, files})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/leads/", checkLeadW, async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		await Leads.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/leads/update", checkLeadW, async (req, res) => {
	try {
		let _id = req.body._id

		let leadID = req.body.leadID
		delete req.body._id
		delete req.body.leadID
		delete req.body.leadType
		delete req.body.memberID
		delete req.body.addedBy

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

		let _ = await Leads.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(leadID + "/" + file.name, file.path)
				fs.unlink(file.path, () => {})
			}))
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router