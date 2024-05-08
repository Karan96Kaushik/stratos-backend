const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");

const {Sales} = require("../models/Sales");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const {generateExcel} = require("../modules/excelProcessor");
const salesFields = require("../statics/salesFields");

const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const tmpdir = "/tmp/"

router.post("/api/sales/add", async (req, res) => {
	try {

		const memberInfo = await Members.findOne({_id: req.user.id})

		let _ = await Sales.create({
			...req.body,
			memberID:memberInfo.memberID,
			memberName:memberInfo.userName,
			meetingStatus:0,
			addedBy: req.user.id
		});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, salesID)
		}

		res.send("OK")
		
	} catch (err) {
		res.status(500).send(err.message)
	}

})

const generateQuery = (req) => {

	let query = {
		$and:[
			{
				$or:[
					{ salesID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoterName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ phone1: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ phone2: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			},
		],
	}

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

	// non sales-read user can only view their own added sales or assigned ones
	if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
		query['$and'].push({ $or: [
			{addedBy: req.user.id},
			{_membersAssigned: req.user.id}
		]})
		query['$and'].push({
			$expr: {
				$not: {
					$and: [
						{ $eq: ["$status", "Cold Lead"] },
						{ $eq: ["$rating", "1"] }
					]
				}
			}
		})
	}

	return query
}

const commonProcessor = (results) => {
	// created & followup timestamp
	results = results.map(val => ({
		...val, 
		// serviceType: val.serviceType.join(', '),
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followUpDate: !val.followUpDate ? "" : moment(new Date(val.followUpDate)).format("DD-MM-YYYY"),
		meetingDate: !val.meetingDate ? "" : moment(new Date(val.meetingDate)).format("DD-MM-YYYY")
	}))

	return results
}

router.post("/api/sales/search", async (req, res) => {
	try{

		req.query = req.body

		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Sales.find(query)
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

		res.json({sales: results})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/sales/export", async (req, res) => {
	try{
		req.query = req.body

		if(!(req.query.password == (process.env.ExportPassword ?? "export45678"))) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Sales.find(query)
			.collation({locale: "en" })

		results = results.map(val => val._doc)

		results = commonProcessor(results)

		let file = await generateExcel(results, salesFields[req.query.salesType ?? 'all'], "salesExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/sales/", async (req, res) => {
	try{
        let query = {"$and" : [{...req.query}]}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
            query['$and'].push({ $or: [
                {addedBy: req.user.id},
                {_membersAssigned: req.user.id}
            ]})
		}

		let sales = await Sales.findOne(query);
		sales = sales._doc

		let files = await getAllFiles(sales.salesID + "/")
		files = files.map(f => f.Key)
		sales.files = files
		
		res.json(sales)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/sales/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		const _id = req.query._id
		delete req.query._id

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
			let result = await Sales.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to delete this task")
				return
			}
		}

		await Sales.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/sales/update", async (req, res) => {
	try {
		let _id = req.body._id

		let salesID = req.body.salesID
		delete req.body._id
		delete req.body.salesID
		delete req.body.memberID
		delete req.body.addedBy

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Sales R")) {
			let result = await Sales.findOne({_id})
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

		let _ = await Sales.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, salesID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router