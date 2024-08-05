const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");

const {parse} = require('csv-parse/sync');

const {CCReceived} = require("../models/CCReceived");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const {generateExcel} = require("../modules/excelProcessor");
const ccreceivedFields = require("../statics/ccreceivedFields");

const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const tmpdir = "/tmp/"

router.post("/api/ccreceived/add", async (req, res) => {
	try {

		const memberInfo = await Members.findOne({_id: req.user.id})

		// if (req.body.remarks?.length > 0)
		// 	req.body.remarks = [moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + req.body.remarks]
		// else
		// 	delete req.body.remarks

		// const ccreceivedIdPrefix = "SL"
		// let ccreceivedID = "SL" + await getID(ccreceivedIdPrefix, padding=100000)
		let _ = await CCReceived.create({
			...req.body,
			memberID:memberInfo.memberID,
			memberName:memberInfo.userName,
			// meetingStatus:0,
			addedBy: req.user.id,
			// ccreceivedID
		});
		// _ = await updateID(ccreceivedIdPrefix)

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, ccreceivedID)
		}

		res.send("OK")
		
	} catch (err) {
		res.status(500).send(err.message)
	}

})

const generateQuery = (req) => {

	const replacementChar = '.*?'

	const text = req.query?.text?.replace(/\s+/g, replacementChar) || '';

	let query = {
		$and:[
			{
				$or:[
					{ dataID: { $regex: new RegExp(text) , $options:"i" }},
					{ promoterName: { $regex: new RegExp(text) , $options:"i" }},
					{ memberInformation: { $regex: new RegExp(text) , $options:"i" }},
					{ certNo: { $regex: new RegExp(text) , $options:"i" }},
					{ district: { $regex: new RegExp(text) , $options:"i" }},
					{ village: { $regex: new RegExp(text) , $options:"i" }},
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

				let operator = i == 0 ? "$lte" : "$gte"
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

	// non ccreceived-read user can only view their own added ccreceived or assigned ones
	if(!req.permissions.isAdmin && !req.permissions.page.includes("CC Received R")) {
		query['$and'].push({ $or: [
			{addedBy: req.user.id},
			// {_membersAssigned: req.user.id},
		]})
		// query['$and'].push({ callingDate: { $lt: new Date() } })
		
	}

	return query
}

const commonProcessor = (results) => {
	// created & followup timestamp
	results = results.map(val => ({
		...val, 
		// serviceType: val.serviceType.join(', '),
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
	}))

	return results
}

router.post("/api/ccreceived/search", async (req, res) => {
	try{

		req.query = req.body

		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		// console.debug(query)

		let results = await CCReceived.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => val._doc)
		// console.debug(results)

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

		res.json({ccreceived: results})
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/ccreceived/export", async (req, res) => {
	try{
		req.query = req.body

		if(!(req.query.password == (process.env.ExportPassword ?? "exp"))) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await CCReceived.find(query)
			.collation({locale: "en" })

		results = results.map(val => val._doc)

		results = commonProcessor(results)

		let file = await generateExcel(results, ccreceivedFields[req.query.ccreceivedType ?? 'all'], "ccreceivedExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/ccreceived/", async (req, res) => {
	try{
        let query = {"$and" : [{...req.query}]}

		if(!req.permissions.isAdmin && !req.permissions.page.includes("CC Received R")) {
            query['$and'].push({ $or: [
                {addedBy: req.user.id},
                // {_membersAssigned: req.user.id}
            ]})
		}

		let ccreceived = await CCReceived.findOne(query);
		ccreceived = ccreceived._doc
		
		// ccreceived.callingDate = ccreceived.callingDate ? moment(ccreceived.callingDate).format("YYYY-MM-DD") : undefined
		

		let files = await getAllFiles(ccreceived.ccreceivedID + "/")
		files = files.map(f => f.Key)
		ccreceived.files = files
		
		res.json(ccreceived)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/ccreceived/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "del")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		const _id = req.query._id
		delete req.query._id

		if(!req.permissions.isAdmin && !req.permissions.page.includes("CC Received R")) {
			let result = await CCReceived.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to delete this task")
				return
			}
		}

		await CCReceived.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/ccreceived/update", async (req, res) => {
	try {
		let _id = req.body._id

		let ccreceivedID = req.body.ccreceivedID
		delete req.body._id
		delete req.body.addedBy

		if(!req.permissions.isAdmin && !req.permissions.page.includes("CC Received R")) {
			let result = await CCReceived.findOne({_id})
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

		let _ = await CCReceived.updateOne(
			{
				_id
			},
			{
				 ...req.body
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, ccreceivedID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/ccreceived/fileupload", async (req, res) => {
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

			// let ccreceivedIdPrefix = 'SL'
			// let ccreceivedID = await getID(ccreceivedIdPrefix)
			// ccreceivedID = ccreceivedID ? parseInt(ccreceivedID) : 0

			let baseDate = +new Date
			records = records.map((r, _i) => ({
				createdTime: new Date(baseDate + _i),
				addedBy: req.user.id,

				dataID: r['Data ID'],
				certNo: r['RERA Cert No'],
				memberInformation: r['Member Details'],
				promoterName: r['Promoter Name'],
				village: r['Project Village'],
				district: r['District'],

				// meetingStatus: 0,
				// ccreceivedID: (ccreceivedID += 1) && ccreceivedIdPrefix + generateID(ccreceivedID),
				// exClientID: r['Client ID'],
				// projectName: r['Name of Project'],
				// certificateNo: r['Certificate No.'],
				// certificateDate: r['Certificate Date'].split('-').reverse().join('-'),
				// phone1: r['Mobile No 1'],
				// phone2: r['Mobile No 2'],
				// completionDate: r['Completion Date'].split('-').reverse().join('-'),
				// purpose: r['Purpose'],
				// form4: (r['Form 4 '] || r['Form 4']).trim() == 'Y',
				// oc: r['OC'],
				// taluka: r['Taluka'],
				// callingDate: new Date((r['Date of Calling'] || "").split('-').reverse().join('-')),
				// _membersAssigned: r['Member ID'].trim().length > 2 ? r['Member ID'].split(',').map(mID => String(allMembers.find(m => m.memberID == mID)?._id)) : [],
				// membersAssigned: r['Member ID'].trim().length > 2 ? r['Member ID'].split(',').map(mID => allMembers.find(m => m.memberID == mID)?.userName) : [],
			}))
			// const erroredRecords = records.filter(r => String(r.callingDate) == 'Invalid Date')
			// const erroredRecordsMembers = records.filter(r => r._membersAssigned.includes('undefined'))
			// records = records.filter(r => String(r.callingDate) == 'Invalid Date' ? {...r, callingDate: undefined} : r)
	
			// if (erroredRecords.length > 0)
			// 	throw new Error("Date of Calling invalid for clients: " + erroredRecords.map(r => r.exClientID).join(', '))
		
			// if (erroredRecordsMembers.length > 0)
			// 	throw new Error("Members invalid for clients: " + erroredRecordsMembers.map(r => r.exClientID).join(', '))
	
			// _ = await updateID(ccreceivedIdPrefix, addCount=records.length)
			_ = await CCReceived.insertMany(records)
		}

		res.send("OK")
		
	} catch (err) {
		res.status(500).send(err.message)
	}

})


module.exports = router