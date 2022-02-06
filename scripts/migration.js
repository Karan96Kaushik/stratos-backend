// Migration script

// to update or add a new parameter in a doc

require('../scripts/db')
const {Members} = require("../models/Members");
const {Leads} = require("../models/Leads");
const {Clients} = require("../models/Clients");
const {Payments} = require("../models/Payments");
const {Tasks} = require("../models/Tasks");
const {Invoices} = require("../models/Invoices");
const {Quotations} = require("../models/Quotations");

const migrateTaskPromoter = async () => {

	let allClients = await Clients.find()
	let allTasks = await Tasks.find({serviceType:"Litigation"})

	console.log(allTasks.length)

	for (task of allTasks) {

		task = task._doc
		// console.log(String(task.clientID))
		if(!task.clientID)
			console.log(task)

		let client = allClients.find(val => String(val.clientID) == String(task.clientID))
		if(!client) {
			console.log(client)
			continue
		}

		let _ = await Tasks.updateOne(
			{_id: String(task._id)}, 
			{
				promoter: client.promoter ?? "",
				_clientID: client._id,
				clientName: client.name,
				_membersAssigned: typeof task._membersAssigned == "string" ? JSON.parse(task._membersAssigned) : task._membersAssigned
			}
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

const calculateTotal = (val) => (
	Number(val.billAmount ?? 0) +
	Number(val.gst ?? 0) +
	Number(val.govtFees ?? 0) +
	Number(val.sroFees ?? 0)
)

const migrateTasksReceivedAmount = async () => {

	let allTasks = await Tasks.find()

	console.log(allTasks.length)

	for (task of allTasks) {
		task = task._doc
		
		if(task.receivedAmount || task.balanceAmount)
			continue
		// console.log(task.taskID)

		let amount = calculateTotal(task)

		let _ = await Tasks.updateOne(
			{_id: String(task._id)}, 
			{
				receivedAmount: 0,
				totalAmount: amount,
				balanceAmount: amount,
			}
		)
		console.log(_)

	}

	console.log("Done")

}

const migrateTasksArchived = async () => {
	let _ = await Tasks.updateMany(
		{}, 
		{
			archived: false
		}
	)

	console.log("Done")
}

const migrateClientAmounts = async () => {

	let allClients = await Clients.find()

	for (client of allClients) {

		let tasks = await Tasks.find({clientID: client.clientID})
		tasks = tasks.map(t => t._doc)
		if(!tasks.length)
			continue

		let totalAmount = tasks.reduce((t, curr) => Number(curr.totalAmount || 0) + t,0)
		let receivedAmount = tasks.reduce((t, curr) => Number(curr.receivedAmount || 0) + t,0)
		let balanceAmount = tasks.reduce((t, curr) => Number(curr.balanceAmount || 0) + t,0)

		// if(!client.promoter) {
		// 	console.log(String(client.clientID))
		// 	continue
		// }

		console.log(client.clientID)

		let _ = await Clients.updateOne(
			{_id: String(client._id)}, 
			{
				receivedAmount,
				balanceAmount,
				totalAmount,
			}
			// {promoter: client.promoter}
		)

	}

	console.log("Done")

}

const updateInvoices = async () => {
	let query = {
		// __v: {$exists: true}
	}

	let allInvoices = await Invoices.find(query)

	for (invoice of allInvoices) {

		invoice = invoice._doc
		invoice.items = [{
			particulars: invoice.particulars,
			billAmount: invoice.billAmount,
			taxAmount: invoice.taxAmount,
			govtFees: invoice.govtFees,

		}]
		console.log(invoice.invoiceID)
		let _ = await Invoices.updateOne({_id: invoice._id}, invoice)

		console.log(_)

	}

	console.log("Done")

}

const removeTasks = async () => {
	let query = {
		serviceType:"Litigation", 
		__v:{$not:{$lte:0}}
	}

	let _ = await Tasks.deleteMany(query)

	console.log(_)

}

const removeInvoices = async () => {
	let query = {
		__v: {$exists: false}
	}

	let _ = await Invoices.deleteMany(query)

	console.log(_)

}

updateInvoices()

// removeInvoices()
// migrateTaskPromoter()

// removeTasks()
// migrateClientAmounts()
// migrateTasksArchived()
// migrateTasksReceivedAmount()
// migrateQuotes()
// migrateLeads()
// migratePayments()