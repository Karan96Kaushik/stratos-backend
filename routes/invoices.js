const router     = new (require('express')).Router()
const moment = require("moment");
const {Invoices} = require("../models/Invoices");
const {Members} = require("../models/Members");
const {invoiceFields} = require("../statics/invoiceFields")
const {generateExcel} = require("../modules/excelProcessor")
const {generateInvoice} = require("../modules/generateInvoice")
const {getID, updateID} = require("../models/Utils");
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")
const fs = require('fs');
const crypto = require('crypto');

const checkInvoiceW = (req, res, next) => {
	// console.log(req.permissions)
	if(req.permissions.isAdmin || req.permissions.page.includes("Invoices W"))
		next()
	else
		res.status(401).send("Unauthorized")
}

const invoiceCodes = {
	"Shantanu Kuchya": "RESK", 
	"RERA Easy": "RERA", 
	"RERA Easy Consultancy": "REC", 
	"Osha Technologies": "RERA", 
	"SDC Legal Services": "RERA", 
	"RERA Easy Services": "RES",
    "Envision Next LLP": "RERA",
	"RERA Easy Legal Advisors": "RELA",
	"KC & PARTNERS": "KC24-251",
}

router.post("/api/invoices/add", checkInvoiceW, async (req, res) => {
	const memberInfo = await Members.findOne({_id: req.user.id})

	req.body.totalAmount = calculateTotal(req.body)
	req.body.billAmount = req.body.items.reduce((prev, item) => (Number(item.billAmount ?? 0) + prev ), 0)
	req.body.taxAmount = req.body.items.reduce((prev, item) => (Number(item.taxAmount ?? 0) + prev ), 0)
		
	req.body.items = req.body.items.map(item => {
		item.totalAmount = calculateTotal(item)
		return item
	})
	req.body.balanceAmount = req.body.totalAmount - (req.body.paidAmount || 0)

	let invoiceCode = invoiceCodes[req.body.from] ?? "RERA"

	req.body.invoiceID = invoiceCode + await getID(invoiceCode, 100000)
	let _ = await Invoices.create({
		...req.body,
		memberID:memberInfo.memberID,
		// invoiceID,
		addedBy: req.user.id
	});
	_ = await updateID(invoiceCode)

	if(req.body.docs?.length) {
		let files = await saveFilesToLocal(req.body.docs)
		await uploadFiles(files, req.body.invoiceID)
	}
	res.send("OK")
})

const generateQuery = (req) => {
	let others = {}

	if(!req.permissions.isAdmin && !req.permissions.page.includes("Invoices R"))
		others.addedBy = req.user.id

	let query = {
		$and:[
			{
				$or:[
					{ billTo: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ invoiceID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ memberID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ projectName: { $regex: new RegExp(req.query.text) , $options:"i" }},
				],
				...others
			}
		],
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

	return query
}

const commonProcessor = (results, members) => {
	results = results.map(val => ({
		...val._doc, 
		totalAmount: calculateTotal(val),
		balanceAmount: calculateTotal(val) - Number(val.paidAmount ?? 0),
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		date:moment(new Date(val.date)).format("DD-MM-YYYY"),
		paymentDate:moment(new Date(val.paymentDate)).format("DD-MM-YYYY"),
		addedBy:members.find(m => String(val.memberID) == String(m.memberID))?.userName ?? "",
	}))
	return results
}

const calculateTotal = (inv) => {
	// Total invoice
	if (inv.items) {
		return inv.items.reduce((prev, val) => (
			Number(val.taxAmount ?? 0) +
			Number(val.billAmount ?? 0) +
			Number(val.govtFees ?? 0) +
			prev
		), 0)
	}
	else {
		return (
			Number(inv.taxAmount ?? 0) +
			Number(inv.billAmount ?? 0) +
			Number(inv.govtFees ?? 0)
		)
	}

}

router.post("/api/invoices/search", async (req, res) => {
	try{

		req.query = req.body

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Invoices R")) {
			res.status(401).send("Unauthorized to view Invoices")
			return
		}

		let others = {}
		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Invoices.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});


		let memberIDs = results.map(i => i.addedBy)
		let members = await Members.find({ _id : {$in:memberIDs}})

		results = commonProcessor(results, members)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/invoices/export", async (req, res) => {
	try{

		req.query = req.body

		if(req.query.password != (process.env.ExportPassword ?? "export45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		let query = generateQuery(req)

		let results = await Invoices.find(query)
			.collation({locale: "en" })

		let memberIDs = results.map(i => i.addedBy)
		let members = await Members.find({ _id : {$in:memberIDs}})

		results = commonProcessor(results, members)

		let file = await generateExcel(results, invoiceFields["all"], "invoicesExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/invoices/", async (req, res) => {
	try{
		const _id = req.query._id
		delete req.query._id
		let invoices = await Invoices.findOne({_id});
		invoices = invoices._doc

		let files = await getAllFiles(invoices.invoiceID + "/")
		files = files.map(({Key}) => (Key))

		invoices.files = files

		res.json(invoices)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/invoices/generate", async (req, res) => {
	try{
		const _id = req.body._id
		delete req.body._id
		let invoice = await Invoices.findOne({_id});
		invoice = invoice._doc
		invoice.date = moment(new Date(invoice.date)).format("DD-MM-YYYY")

		const invoicePdfPath = await generateInvoice(invoice)

		res.download(invoicePdfPath,(err) => {
			fs.unlink(invoicePdfPath, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/invoices/search/all", async (req, res) => {
	let query = req.query

	const invoices = await Invoices.find(query);

	res.json(invoices)
})

router.post("/api/invoices/update", checkInvoiceW, async (req, res) => {
	try {
		let _id = req.body._id
		let invoiceID = req.body.invoiceID

		// delete req.body.invoiceID
		delete req.body._id
		delete req.body.memberID
		delete req.body.addedBy

		req.body.totalAmount = calculateTotal(req.body)
		req.body.billAmount = req.body.items.reduce((prev, item) => (Number(item.billAmount ?? 0) + prev ), 0)
		req.body.taxAmount = req.body.items.reduce((prev, item) => (Number(item.taxAmount ?? 0) + prev ), 0)

		req.body.items = req.body.items.map(item => {
			item.totalAmount = calculateTotal(item)
			return item
		})
		req.body.balanceAmount = req.body.totalAmount - Number(req.body.paidAmount || 0)

		let _ = await Invoices.updateOne(
			{
				_id
			},
			{
				...req.body
			});

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, invoiceID)
		}

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/invoices/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "delete45678")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		const _id = req.query._id
		const _ = await Invoices.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

module.exports = router