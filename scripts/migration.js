// Migration script

// to update or add a new parameter in a doc

require('../scripts/db')
const {Members} = require("../models/Members");
const {Leads} = require("../models/Leads");
const {Clients} = require("../models/Clients");
const {Payments} = require("../models/Payments");
const {Tasks} = require("../models/Tasks");
const {Quotations} = require("../models/Quotations");

const migrateTaskPromoter = async () => {

	let allClients = await Clients.find()
	let allTasks = await Tasks.find({})

	console.log(allTasks.length)

	for (task of allTasks) {

		let client = allClients.find(val => String(val._id) == String(task._clientID))
		if(!client) {
			console.log(String(task.clientID))
			continue
		}

		if(!client.promoter) {
			console.log(String(task.clientID))
			continue
		}

		let _ = await Tasks.updateOne(
			{_id: String(task._id)}, 
			{promoter: client.promoter}
		)

	}

	console.log("Done")

}

const migrateQuotes = async () => {

	let allMembers = await Members.find()
	let allQuotations = await Quotations.find({})

	console.log(allQuotations.length)

	for (quote of allQuotations) {

		let member = allMembers.find(val => String(val._id) == String(quote.addedBy))
		if(!member) {
			console.log(String(quote.addedBy))
			continue
		}

		serviceType = quote.serviceType

		if(serviceType && typeof serviceType == "string")
			serviceType = [serviceType]
		else if (!serviceType)
			serviceType = []

		// console.log({_id: String(quote._id)}, {memberName: member.userName})
		let _ = await Quotations.updateOne(
			{_id: String(quote._id)}, 
			{serviceType: JSON.stringify(serviceType)}
		)
		// console.log(_)

	}

	console.log("Done")

}

const migrateLeads = async () => {

	let allMembers = await Members.find()
	let allLeads = await Leads.find({})

	console.log(allLeads.length)

	for (lead of allLeads) {

		let member = allMembers.find(val => String(val._id) == String(lead.addedBy))
		if(!member) {
			console.log(String(lead.addedBy))
			continue
		}

		console.log({_id: String(lead._id)}, {memberName: member.userName})
		let _ = await Leads.updateOne({_id: String(lead._id)}, {...lead._doc,memberName: member.userName})
		console.log(_)

	}

	console.log("Done")

}

const migratePayments = async () => {

	let allTasks = await Tasks.find()
	let allPayments = await Payments.find()

	console.log(allPayments.length)

	for (payment of allPayments) {

		let task = allTasks.find(val => String(val.taskID) == String(payment.taskID))
		if(!task) {
			console.log(String(payment))
			continue
		}

		let _ = await Payments.updateOne(
			{_id: String(payment._id)}, 
			{
				clientName: task.clientName,
				promoter: task.promoter
			}
		)
		console.log(_)

	}

	console.log("Done")

}


migrateTaskPromoter()
// migrateQuotes()
// migrateLeads()
// migratePayments()