const router     = new (require('express')).Router()
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");

const {Procurements} = require("../models/Procurements");
const {Members} = require("../models/Members");
const {getID, updateID} = require("../models/Utils");

const {generateExcel} = require("../modules/excelProcessor");
const procurementFields = require("../statics/procurementFields");
const { approvalNeededNotification, procurementUpdatedNotification } = require("../modules/notificationHelpers");

const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const tmpdir = "/tmp/"

router.post("/api/procurements/add", async (req, res) => {
	try {
		const memberInfo = await Members.findOne({_id: req.user.id})

		let procurementIdPrefix = "PREQ"

        req.body.total = Number(req.body.amount ?? 0) + (Number(req.body.gstamount ?? 0)) + (Number(req.body.tdsamount ?? 0))

        memberInfo.userName = memberInfo.userName.trim()

		if (req.body.remarks) {
			req.body.remarks = [moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + req.body.remarks + ' - ' + memberInfo.userName]
		}

		let procurementID = procurementIdPrefix + await getID(procurementIdPrefix)
		let procurement = await Procurements.create({
			...req.body,
			memberID:memberInfo.memberID,
			memberName:memberInfo.userName,
			procurementID,
			addedBy: req.user.id,
			addedByName: memberInfo.userName
		});
		_ = await updateID(procurementIdPrefix)

		if(req.body.docs?.length) {
			let files = await saveFilesToLocal(req.body.docs)
			await uploadFiles(files, procurementID)
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
					{ procurementID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ billNo: { $regex: new RegExp(req.query.text) , $options:"i" }},
                    { referenceNo: { $regex: new RegExp(req.query.text) , $options:"i" }},

				]
			}
		],
	}

	if(req.query.procurementType) {
		query['$and'].push({
			procurementType: req.query.procurementType
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

    if (req.query.isPendingApprovals) {
        query['$and'].push({_approvers: req.user.id})
        query['$and'].push({status: "Pending Approval"})
        // query['$and'].push({approvedBy: {$ne: req.user.id}})
    }
    else if (req.query.isAccounts) {
        query['$and'].push({$or: [{status: "Approved"}, {status: "Completed"}]})
    }
	// non procurements-read user can only view their own added procurements or assigned ones
	else if(!req.permissions.isAdmin && !req.permissions.page.includes("Procurements R") && !req.permissions.page.includes("Procurements R Servicewise")) {
		query['$and'].push({ $or: [
			{addedBy: req.user.id},
			{_membersAssigned: req.user.id}
		]})
	}

	return query
}

const commonProcessor = (results) => {
	// created & followup timestamp
	results = results.map(val => ({
		...val, 
		createdTime:moment(new Date(val.createdTime)).format("DD-MM-YYYY"),
		followUpDate: !val.followUpDate ? "" : moment(new Date(val.followUpDate)).format("DD-MM-YYYY"),
        existingRemarks: Array.isArray(val.remarks) ? val.remarks : [val.remarks],
        remarks: ''
	}))

	return results
}

router.post("/api/procurements/search", async (req, res) => {
	try{

		req.query = req.body

		const rowsPerPage = parseInt(req.query.rowsPerPage)
		const sortID = req.query.sortID
		const sortDir = parseInt(req.query.sortDir)
		const page = parseInt(req.query.page)-1

		let query = generateQuery(req)

		let results = await Procurements.find(query)
			.collation({locale: "en" })
			.limit(rowsPerPage)
			.skip(rowsPerPage * page)
			.sort({[sortID || "createdTime"]: sortDir || -1});

		results = results.map(val => val._doc)

        if (req.query.isAccounts && !req.permissions.page.includes("Procurements Accounts")) {
            throw new Error("Unauthorized access to procurements accounts!")
        }

		// followup duration color coding
		// results = results.map(val => {
		// 	let followUpDateColor = +new Date(val.followUpDate) - +new Date()

		// 	if(followUpDateColor < 0)						// follow up date passed
		// 		followUpDateColor = 2
		// 	else if(followUpDateColor < 1000*60*60*24*3) 	// 3 days pending
		// 		followUpDateColor = 1
		// 	else 											// more than 3 days
		// 		followUpDateColor = 0

		// 	return ({...val, followUpDateColor})
		// })

		results = commonProcessor(results)

		res.json(results)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/procurements/export", async (req, res) => {
	try{
		req.query = req.body

		if(!(req.query.password == (process.env.ExportPassword ?? "export45678"))) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password

		let query = generateQuery(req)

		let results = await Procurements.find(query)
			.collation({locale: "en" })

		results = results.map(val => val._doc)

		results = commonProcessor(results)

		let file = await generateExcel(results, procurementFields[req.query.procurementType ?? 'all'], "procurementsExport" + (+new Date))

		res.download("/tmp/" + file,(err) => {
			fs.unlink("/tmp/" + file, () => {})
		})

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/api/procurements/", async (req, res) => {
	try{
		const query = req.query

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Procurements R") && !req.permissions.page.includes("Procurements Accounts")) {
			query.addedBy = req.user.id
		}

		let procurements = await Procurements.findOne({...query});
        if (!procurements) {
            throw new Error("Procurement not found")
        }
		procurements = procurements._doc

		let files = await getAllFiles(procurements.procurementID + "/")
		files = files.map(f => f.Key)
		procurements.files = files

		procurements.existingRemarks = Array.isArray(procurements.remarks) ? procurements.remarks : [procurements.remarks]
		procurements.remarks = ''
		
		res.json(procurements)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.delete("/api/procurements/", async (req, res) => {
	try{

		if(req.query.password != (process.env.DeletePassword ?? "del")) {
			res.status(401).send("Incorrect password")
			return
		}
		delete req.query.password
		
		const _id = req.query._id
		delete req.query._id

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Procurements W")) {
			let result = await Procurements.findOne({_id})
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to delete this task")
				return
			}
		}

		await Procurements.deleteOne({_id});
		// console.log(clients)
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/procurements/approve", async (req, res) => {
	try {
		let _id = req.body._id
		let procurementID = req.body.procurementID
		delete req.body._id
		delete req.body.procurementID

		const memberInfo = await Members.findOne({_id: req.user.id})

        let newRemarks = []
        let remarks = ''
        remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + 'Approved'
        if (memberInfo?.userName)
            remarks = remarks + ' - ' + memberInfo.userName
        newRemarks.push(remarks)

		let procurement = await Procurements.findOneAndUpdate({_id, _approvers: req.user.id, }, {
			$push: {
				approvedBy: req.user.id,
				approvedByName: memberInfo.userName,
				remarks: { $each: newRemarks }
			},
			$set: {
				lastApproverDate: new Date()
			}
		})
		if(!procurement) {
			res.status(404).send("Procurement not found")
			return
		}

        try {
            await procurementUpdatedNotification(procurement?._doc)
        } catch (err) {
            console.error('Error sending procurement updated notification:', err)
        }

        // Check if all approvers have approved
        let proc = await Procurements.findOne({_id})
		proc = proc._doc
		console.log('proc', proc._approvers, proc.approvedBy, proc._approvers.length === proc.approvedBy.length)
        if (proc._approvers && proc.approvedBy && proc._approvers.length === proc.approvedBy.length) {
            await Procurements.updateOne({_id}, {
                $set: {
                    status: "Approved"
                }
            })
        }

		// await procurement.save()
		res.send("OK")

	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/api/procurements/update", async (req, res) => {
	try {
		let body = {...req.body.updateData}
		let original = {...req.body.originalData}
		let member = {...req.body.member}

		if (!body || !original)
			throw new Error('There was an issue in the update, please refresh the page and try again')

		let _id = body._id
		let procurementID = body.procurementID
		delete body._id
		delete body.procurementID
		delete body.memberID
		delete body.addedBy

        body.total = Number(body.amount ?? 0) + (Number(body.gstamount ?? 0)) + (Number(body.tdsamount ?? 0))

		if(!req.permissions.isAdmin && !req.permissions.page.includes("Procurements R")) {
			let result = await Procurements.findOne({_id})
            if (!result) {
                throw new Error("Procurement not found")
            }
			if (String(result.addedBy) != req.user.id) {
				res.status(401).send("Unauthorized to update this task")
				return
			}
		}

		let files
		if(body.docs?.length) {
			files = await Promise.all(body.docs.map(async (file) => new Promise((resolve, reject) => {
				file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
				file.name = parseInt(Math.random()*1000) + "_" + file.name

				let fileName = tmpdir + +new Date + "_" + file.name

				const fileContents = Buffer.from(file.data, 'base64')
				fs.writeFile( fileName, fileContents, 'base64', (err) => {
					if (err) reject(err)
					resolve({name:file.name,path:fileName})
				})
			})))
		}

		let newRemarks = []
		let remarks = ''
		if (body.remarks?.length > 0) {
			remarks = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + body.remarks
			if (member?.userName)
				remarks = remarks + ' - ' + member.userName
			newRemarks.push(remarks)
		}

        if (original.status != body.status) {
            let status = moment(new Date(+new Date + 5.5*3600*1000)).format('DD/MM/YYYY HH:mm') + ' - ' + 'Status updated to ' + body.status
            if (member?.userName)
                status = status + ' - ' + member.userName
            newRemarks.push(status)
        }

		let existingRemarks = body.existingRemarks || original.existingRemarks

		if (Array.isArray(existingRemarks)) {
			delete body.remarks
		}
		else if (newRemarks.length) {
			body.remarks = newRemarks
		}

		delete body.existingRemarks

        if (body.status == 'Completed' && body.paidAmount && body.paymentReference && original.status != 'Completed') {
            body.paymentDate = new Date()
            body.tat = parseInt((new Date() - new Date(original.createdTime)) / (1000 * 60 * 60 * 24))
			body.isLocked = true
        }

		let updatedProcurement = await Procurements.findOneAndUpdate(
			{
				_id
			},
			{
				$set: { ...body },
				$push: (newRemarks.length > 0 && Array.isArray(existingRemarks)) 
					? { remarks: { $each: newRemarks } } 
					: {}
			},
            { new: true }
        );


        // Send approval needed notification if there are approvers
        if (body._approvers?.length && body.status == 'Pending Approval') {
            try {
                // Get new approvers that weren't in original
                const newApprovers = body._approvers.filter(approver => 
                    !original._approvers?.includes(approver)
                );

                console.log('updatedProcurement', updatedProcurement)
				const isStatusChanged = (body.status == 'Pending Approval' && original.status != 'Pending Approval')
                if (newApprovers?.length || isStatusChanged) {
                    await approvalNeededNotification({...updatedProcurement._doc, _approvers: (isStatusChanged ? body._approvers : newApprovers)})
                }
            } catch (err) {
                console.error('Error sending approval needed notification:', err)
            }
        }

		if(body.docs?.length) {
			let files = await saveFilesToLocal(body.docs)
			await uploadFiles(files, procurementID)
		}

        // Send procurement updated notification
        try {
            console.log('updatedProcurement', updatedProcurement?._doc)
            await procurementUpdatedNotification(updatedProcurement?._doc)
        } catch (err) {
            console.error('Error sending procurement updated notification:', err)
        }

		res.send("OK")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})


module.exports = router