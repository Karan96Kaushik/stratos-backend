const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const {Payments} = require("../models/Payments");
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
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
const { QueryGenerator } = require("../modules/QueryGenerator")

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

const generateQuery = (req) => {

	let queryGen = new QueryGenerator(req, "Clients", {debug:false})

	queryGen.applyFilters()
	queryGen.setAddedBy("Clients R")
	queryGen.setSearchAll("clientType")

	return queryGen.query

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

const commonProcessor = (results) => {
	results = results.map(val => ({
		...val._doc, 
		createdTime: moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		completionDate: val.completionDate ? moment(new Date(processDate(val.completionDate))).format("DD-MM-YYYY") : "-",
	}))
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

		results = commonProcessor(results)

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

		results = commonProcessor(results)

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

	let queryGen = new QueryGenerator(req, "ClientPayments", {debug:false})

	queryGen.applyFilters()

	return queryGen.query
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
		totalAmount: val.tasks.reduce((tot, curr) => Number(curr.totalAmount) + tot,0),
		receivedAmount: val.payments.reduce((tot, curr) => Number(curr.receivedAmount) + tot,0),
		taskList: val.tasks.map(v => v.taskID).join(", "),
	}))
	results = results.map(val => ({...val, balanceAmount: Number(val.totalAmount) - Number(val.receivedAmount)}))
	return results
}

router.post("/api/clients/payments/search", async (req, res) => {
	try{
		req.query = req.body

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

		let clients = await Clients.findOne(req.query);
		if(!clients){
			res.status(404).send("Client not found")
		}

		clients.certDate = moment(new Date(processDate(clients.certDate))).format("YYYY-MM-DD")
		clients.completionDate = moment(new Date(processDate(clients.completionDate))).format("YYYY-MM-DD")

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