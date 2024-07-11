const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const {Packages} = require("../models/Packages");
const {Members} = require("../models/Members");
const {generateExcel} = require("../modules/excelProcessor");
const clientFields = require("../statics/clientFields");
const {clientPaymentFields} = require("../statics/paymentFields")
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const fs = require('fs');
const crypto = require('crypto');
const client = require('../scripts/redisClient');

const tmpdir = "/tmp/"

const maskString = (str) => str && str.length > 4 ? str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2) : str
const isMasked = str => /\*{3,}/.test(str);

const checkR = (req, res, next) => {
	const isPermitted = req.permissions.isAdmin || req.permissions.page.includes("Clients R")

	if(typeof next !== "function") {
		return isPermitted
	}

	if(isPermitted)
		next()
	else
		res.status(401).send("Unauthorized Access")
}

const checkW = (req, res, next) => {
	const isPermitted = req.permissions.isAdmin || req.permissions.page.includes("Clients W")

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

const generateQuery = (req, ignorePermissions=false) => {

	let query = {
		$and:[
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ location: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ userID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ email: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ mobile: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		if(filter == "balanceStatus") {
			if(req.query.filters[filter] == "Nil") 
				query['$and'].push({
					balanceAmount: {$lte:0}
				})
			else if(req.query.filters[filter] == "Pending") 
				query['$and'].push({
					balanceAmount: {$gt:0}
				})

			return
		}

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

	if(!req.query.searchAll) {
		query['$and'].push({
			clientType: req.query.clientType
		})
	}

	if(!checkR(req) && !req.query.ignorePermissions)
		query['$and'].push({
			addedBy : req.user.id
		})

	return query
}

const processDate = (compDate) => {
	if(!compDate)
		return "-"

	else if(typeof compDate == "date")
		return compDate

	// to handle dates in the format of "30.12.2021"
	else if (compDate.includes("."))
		return new Date(compDate.split(".").reverse().join("-"))

	else 
		return new Date(compDate)
}

function encrypt(text, shift=12) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text.charCodeAt(i);
        if (char >= 65 && char <= 90) {
            // Uppercase letters
            result += String.fromCharCode((char - 65 + shift) % 26 + 65);
        } else if (char >= 97 && char <= 122) {
            // Lowercase letters
            result += String.fromCharCode((char - 97 + shift) % 26 + 97);
        } else {
            // Non-alphabetical characters
            result += text.charAt(i);
        }
    }
    return result;
}

const commonProcessor = (results, isExport=false, isAdmin=false, permissions) => {
	results = results.map(val => ({
		...val._doc, 
		createdTime: moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		completionDate: val.completionDate ? moment(new Date(processDate(val.completionDate))).format("DD-MM-YYYY") : "-",
		mobile: !isExport ? maskString(val.mobile) : val.mobile,
		office: !isExport ? maskString(val.office) : val.office,
		email: !isExport ? maskString(val.email) : val.email,
		u: !isExport && encrypt(JSON.stringify({userID: val.userID, password: val.password}))
	}))

	if (!isAdmin && !permissions.system.includes('View RERA Passwords'))
		results = results.map(r => ({...r, userID: r.userID && '***', password: r.password && '***'}))
	
	return results
}

router.post("/api/clients/search", async (req, res) => {
	try{

		req.query = req.body

		if(!req.query.clientType && !req.query.searchAll) {
			res.json({})
			return
		}

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage ?? 10)
		const page = parseInt(req.query.page ?? 1)-1
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)

		let query = generateQuery(req)
			
		let results = await Clients.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = commonProcessor(results, false, req.permissions.isAdmin, req.permissions)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/clients/export", async (req, res) => {
	try{

		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Clients.find(query)
			.collation({locale: "en" })
			
			
		results = commonProcessor(results, true, req.permissions.isAdmin, req.permissions)

		let file = await generateExcel(results, clientFields[req.query.searchAll ? "all" : req.query.clientType], "clientsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

const generatePaymentsQuery = (req) => {

	let query = {
		$and:[
			{
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ location: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ userID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ email: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ mobile: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			}
		],
	}

	// add filters to the query, if present
	Object.keys(req.query.filters ?? []).forEach(filter => {

		if(filter == "balanceStatus") {
			if(req.query.filters[filter] == "Nil") 
				query['$and'].push({
					balanceAmount: {$lte:0}
				})
			else if(req.query.filters[filter] == "Pending") 
				query['$and'].push({
					balanceAmount: {$gt:0}
				})

			return
		}

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

	return query
}

const commonPaymentsProcessor = async (results) => {
	const clientIDs = results.map(v => v.clientID)
	let payments = await Payments.find({
		clientID: {$in:clientIDs}
	})
	payments = payments.map(v => v._doc)

	let tasks = payments.map(v => v.taskID)
	tasks = await Tasks.find({
		clientID: {$in: clientIDs}
	})
	tasks = tasks.map(v => v._doc)

	results = results.map(val => ({
		...val._doc, 
		createdTime: moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		completionDate: val.completionDate ? moment(new Date(processDate(val.completionDate))).format("DD-MM-YYYY") : "-",
		tasks: tasks.filter(v => (String(val.clientID) == String(v.clientID))),
		payments: payments.filter(v => (String(val.clientID) == String(v.clientID)))
	}))
	results = results.map(val => ({
		...val, 
		// totalAmount: val.tasks.reduce((tot, curr) => Number(curr.totalAmount) + tot,0),
		// receivedAmount: val.payments.reduce((tot, curr) => Number(curr.receivedAmount) + tot,0),
		taskList: val.tasks.map(v => v.taskID).join(", "),
	}))
	// results = results.map(val => ({...val, balanceAmount: Number(val.totalAmount) - Number(val.receivedAmount)}))
	return results
}

router.post("/api/clients/payments/search", async (req, res) => {
	try{
		req.query = req.body

		if(!req.permissions.isAdmin)
			if(!req.permissions.page.includes("Payments R") || !req.permissions.page.includes("Tasks R")) {
				res.status(401).send("Unauthorized access")
				return
			}

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage ?? 10)
		const page = parseInt(req.query.page ?? 1)-1
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)

		let query = generatePaymentsQuery(req)
			
		let results = await Clients.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = await commonPaymentsProcessor(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/clients/payments/export", async (req, res) => {
	try{

		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generatePaymentsQuery(req)

		let results = await Clients.find(query)
			.collation({locale: "en" })

		results = await commonPaymentsProcessor(results)

		let file = await generateExcel(results, clientPaymentFields, "clientAccountsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

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

		let client = await Clients.findOne(req.query);
		if(!client){
			res.status(404).send("Client not found")
		}
		client = client._doc

		client.certDate = moment(new Date(processDate(client.certDate))).format("YYYY-MM-DD")
		client.completionDate = moment(new Date(processDate(client.completionDate))).format("YYYY-MM-DD")
		client.mobile = maskString(client.mobile)
		client.office = maskString(client.office)
		client.email = maskString(client.email)

		if (!req.permissions.isAdmin && !req.permissions.system.includes('View RERA Passwords')) {
			client.userID = client.userID && '***'
			client.password = client.userID && '***'
		}

		let files = await getAllFiles(client.clientID + "/")

		files = files.map(f => f.Key)
		res.json({...client, files})
		
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/clients/", checkW, async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

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

		if (req.body.mobile && isMasked(req.body.mobile)) delete req.body.mobile
		if (req.body.office && isMasked(req.body.office)) delete req.body.office
		if (req.body.email && isMasked(req.body.email)) delete req.body.email
		if (req.body.userID === '***') delete req.body.userID
		if (req.body.password === '***') delete req.body.password

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
			// console.log(files)

		}

		let _ = await Clients.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		
		_ = await Tasks.updateMany(
			{ _clientID: String(_id) },
			{
				clientName:req.body.name,
				promoter:req.body.promoter
			}
		)

		_ = await Packages.updateMany(
			{ _clientID: String(_id) },
			{
				clientName:req.body.name,
				promoter:req.body.promoter
			}
		)

		if(files?.length) {
			await Promise.all(files.map(async (file) => {
				await uploadToS3(clientID + "/" + file.name, file.path)
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