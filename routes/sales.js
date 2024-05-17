const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");

const {parse} = require('csv-parse/sync');

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

		if (req.body.remarks?.length > 0)
			req.body.remarks = [moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + req.body.remarks]
		else
			delete req.body.remarks

		const salesIdPrefix = "SL"
		let salesID = "SL" + await getID(salesIdPrefix)
		let _ = await Sales.create({
			...req.body,
			memberID:memberInfo.memberID,
			memberName:memberInfo.userName,
			meetingStatus:0,
			addedBy: req.user.id,
			salesID
		});
		_ = await updateID(salesIdPrefix)

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
					{ exClientID: { $regex: new RegExp(req.query.text) , $options:"i" }},
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
			{_membersAssigned: req.user.id},
		]})
		query['$and'].push({ callingDate: { $lt: new Date() } })
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
		completionDate: !val.completionDate ? "" : moment(new Date(val.completionDate)).format("DD-MM-YYYY"),
		certificateDate: !val.certificateDate ? "" : moment(new Date(val.certificateDate)).format("DD-MM-YYYY"),
		callingDate: !val.callingDate ? "" : moment(new Date(val.callingDate)).format("DD-MM-YYYY"),
		followUpDate: !val.followUpDate ? "" : moment(new Date(val.followUpDate)).format("DD-MM-YYYY"),
		meetingDate: !val.meetingDate ? "" : moment(new Date(val.meetingDate)).format("DD-MM-YYYY"),
		remarks: Array.isArray(val.remarks) ? val.remarks : [val.remarks]
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

		// results = results.map(val => {
		// 	let callingDateColor = +new Date(val.callingDate) - +new Date()

		// 	if(callingDateColor < 0)						// follow up date passed
		// 		callingDateColor = 2
		// 	else if(callingDateColor < 1000*60*60*24*3) 	// 3 days pending
		// 		callingDateColor = 1
		// 	else 											// more than 3 days
		// 		callingDateColor = 0

		// 	return ({...val, callingDateColor})
		// })

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

		if(!(req.query.password == (process.env.ExportPassword ?? "exp"))) {
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
		
		sales.callingDate = sales.callingDate ? moment(sales.callingDate).format("YYYY-MM-DD") : undefined
		sales.followUpDate = sales.followUpDate ? moment(sales.followUpDate).format("YYYY-MM-DD") : undefined
		sales.meetingDate = sales.meetingDate ? moment(sales.meetingDate).format("YYYY-MM-DD") : undefined
		sales.completionDate = sales.completionDate ? moment(sales.completionDate).format("YYYY-MM-DD") : undefined
		sales.certificateDate = sales.certificateDate ? moment(sales.certificateDate).format("YYYY-MM-DD") : undefined
		sales.existingRemarks = sales.remarks

		delete sales.remarks

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

		if(req.query.password != (process.env.DeletePassword ?? "del")) {
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
			// console.log(result._doc)
			if (String(result.addedBy) != req.user.id && !result._doc._membersAssigned.includes(req.user.id)) {
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

		let remarks = ''
		if (req.body.remarks?.length > 0) 
			remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + req.body.remarks

		let existingRemarks = req.body.existingRemarks

		if (Array.isArray(existingRemarks)) {
			delete req.body.remarks
		}
		else {
			req.body.remarks = [remarks]
		}
		delete req.body.existingRemarks

		let _ = await Sales.updateOne(
			{
				_id
			},
			{
				$set: { ...req.body },
				$push: (remarks.length > 0 && Array.isArray(existingRemarks)) ? { remarks: remarks } : {}
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

router.post("/api/sales/fileupload", async (req, res) => {
	try {

		const generateID = (idNum, padding=100000) => {
			idNum = String(padding + (idNum ?? 0) + 1)
			return idNum.substring(1,)
		}

		const memberInfo = await Members.findOne({_id: req.user.id})

		// console.debug(req.body.docs?.length, 'files')
		if(req.body.docs?.length) {

			const fileContents = Buffer.from(req.body.docs[0].data, 'base64');
			let allMembers = await Members.find()
			allMembers = allMembers.map(m => m._doc)

			const csvData = fileContents.toString('utf8');

			let records = parse(csvData, {
				columns: true,
				skip_empty_lines: true
			});

			let salesIdPrefix = 'SL'
			let salesID = await getID(salesIdPrefix)
			salesID = salesID ? parseInt(salesID) : 0

			let baseDate = +new Date
			records = records.map((r, _i) => ({
				createdTime: new Date(baseDate + _i),
				addedBy: req.user.id,
				meetingStatus: 0,
				salesID: (salesID += 1) && salesIdPrefix + generateID(salesID),
				exClientID: r['Client ID'],
				promoterName: r['Name of Promoter'],
				projectName: r['Name of Project'],
				certificateNo: r['Certificate No.'],
				certificateDate: r['Certificate Date'].split('-').reverse().join('-'),
				phone1: r['Mobile No 1'],
				phone2: r['Mobile No 2'],
				district: r['District'],
				completionDate: r['Completion Date'].split('-').reverse().join('-'),
				purpose: r['Purpose'],
				form4: (r['Form 4 '] || r['Form 4']).trim() == 'Y',
				oc: r['OC'],
				taluka: r['Taluka'],
				village: r['Village'],
				callingDate: new Date((r['Date of Calling'] || "").split('-').reverse().join('-')),
				_membersAssigned: r['Member ID'].trim().length > 2 ? r['Member ID'].split(',').map(mID => String(allMembers.find(m => m.memberID == mID)?._id)) : [],
				membersAssigned: r['Member ID'].trim().length > 2 ? r['Member ID'].split(',').map(mID => allMembers.find(m => m.memberID == mID)?.userName) : [],
			}))
			const erroredRecords = records.filter(r => String(r.callingDate) == 'Invalid Date')
			const erroredRecordsMembers = records.filter(r => r._membersAssigned.includes('undefined'))
			// records = records.filter(r => String(r.callingDate) == 'Invalid Date' ? {...r, callingDate: undefined} : r)
	
			if (erroredRecords.length > 0)
				throw new Error("Date of Calling invalid for clients: " + erroredRecords.map(r => r.exClientID).join(', '))
		
			if (erroredRecordsMembers.length > 0)
				throw new Error("Members invalid for clients: " + erroredRecordsMembers.map(r => r.exClientID).join(', '))
	
			_ = await updateID(salesIdPrefix, addCount=records.length)
			_ = await Sales.insertMany(records)
		}

		res.send("OK")
		
	} catch (err) {
		res.status(500).send(err.message)
	}

})


module.exports = router