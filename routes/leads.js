const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");

const {Leads} = require("../models/Leads");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const {generateExcel} = require("../modules/excelProcessor");
const leadFields = require("../statics/leadFields");
const crypto = require('crypto');

const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

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

const tmpdir = "/tmp/"

router.post("/api/leads/add", async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})

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
		memberName:memberInfo.userName,
		leadID,
		addedBy: req.user.id
	});
	_ = await updateID(leadIdPrefix)

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, leadID)
	}
	res.send("OK")
})

const generateQuery = (req) => {

	let others = {}

	if(!req.query.leadType && !req.query.searchAll) {
		res.send()
		return
	}

	let query = {
		$and:[
			{
				$or:[
					{ leadID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ leadResponsibility: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ memberName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ mobile: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ email: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ location: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ companyName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ office: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	if(!req.query.searchAll) {
		query['$and'].push({
			leadType: req.query.leadType
		})
	}

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		// filter is range - date/number
		if(typeof req.query.filters[filter] == "object") {
			req.query.filters[filter].forEach((val,i) => {
				if(val == null)
					return

				let operator = i == 0 ? "$lt" : "$gt"
				query['$and'].push({
					[filter]: {
						[operator]: val
					}
				})	
			})
		} 
		// filter is normal value
		else {
			query['$and'].push({
				[filter]: req.query.filters[filter]
			})	
		}
	})

	// non leads-read user can only view their own added leads
	if(!req.permissions.page.includes("Leads R")) {
		query['$and'].push({
			addedBy: req.user.id
		})
	}

	return query
}

const commonProcessor = (results) => {
	// created & followup timestamp
	results = results.map(val => ({
		...val, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followUpDate: !val.followUpDate ? "" : moment(new Date(val.followUpDate)).format("DD-MM-YYYY")
	}))

	return results
}

router.post("/api/leads/search", async (req, res) => {
	try{

		req.query = req.body

		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Leads.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => val._doc)

		// followup duration color coding
		results = results.map(val => {
			let followUpDateColor = +new Date(val.followUpDate) - +new Date()

			if(followUpDateColor < 0)						// follow up date passed
				followUpDateColor = 2
			else if(followUpDateColor < 1000*60*60*24*3) 	// 3 days pending
				followUpDateColor = 1
			else 											// more than 3 days
				followUpDateColor = 0

			return ({...val, followUpDateColor})
		})

		results = commonProcessor(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/leads/export", async (req, res) => {
	try{
		req.query = req.body

		let password = crypto.createHmac('sha256', "someSalt")
			.update(req.query.password)
			.digest('hex')
		delete req.query.password

		let user = await Members.findOne({_id: req.user.id, password})
		if(!user) {
			res.status(401).send("Incorrect password")
			return
		}


		let query = generateQuery(req)

		let results = await Leads.find(query)
			.collation({locale: "en" })

		results = results.map(val => val._doc)

		results = commonProcessor(results)

		let file = await generateExcel(results, leadFields[req.query.leadType], "leadsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

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

		let leads = await Leads.findOne({...query});
		leads = leads._doc

		let files = await getAllFiles(leads.leadID + "/")
		files = files.map(f => f.Key)
		leads.files = files
		
		res.json(leads)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/leads/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id

		if(!req.permissions.page.includes("Leads R")) {
			let result = await Leads.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to delete this task")
				return
			}
		}

		await Leads.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/leads/update", async (req, res) => {
	try {
		let _id = req.body._id

		let leadID = req.body.leadID
		delete req.body._id
		delete req.body.leadID
		delete req.body.leadType
		delete req.body.memberID
		delete req.body.addedBy

		if(!req.permissions.page.includes("Leads R")) {
			let result = await Leads.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to update this task")
				return
			}
		}

		let files
		if(req.body.docs?.length) {
			files = await Promise.all(req.body.docs.map(async (file) => new Promise((resolve, reject) => {
				file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
				file.name = parseInt(Math.random()*1000) + "_" + file.name

				let fileName = tmpdir + +new Date + "_" + file.name

				const fileContents = Buffer.from(file.data, 'base64')
				fs.writeFile( fileName, fileContents, 'base64', (err) => {
					// console.log(err)
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

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, leadID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router