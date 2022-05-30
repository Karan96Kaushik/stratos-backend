const {Payments} = require("../models/Payments");
const {Tasks} = require("../models/Tasks");
const {Clients} = require("../models/Clients");
const {Packages} = require("../models/Packages");

const calculateTotal = (val) => (
	Number(val.billAmount ?? 0) +
	Number(val.gst ?? 0) +
	Number(val.govtFees ?? 0) +
	Number(val.sroFees ?? 0)
)

// manages denormalised balance/received amount in Clients/Tasks
const handlePayment = async (body, originalPaymentId) => {
	let originalPayment, 
		_, 
		paymentAmount = 0,
		task,
		client,
		package
		
	if(originalPaymentId) {
		originalPayment = await Payments.findOne({_id: originalPaymentId});
		originalPayment = originalPayment._doc

		body.packageID = originalPayment.packageID
		body._packageID = originalPayment._packageID
		body._taskID = originalPayment._taskID
		body._clientID = originalPayment._clientID
	}

	// PAYMENTS
	let paymentQuery = {taskID: body.taskID}
	if (body.packageID)
		paymentQuery = {packageID: body.packageID}

	let payments = await Payments.find(paymentQuery)

	if (payments.length)
		paymentAmount = payments.map(v => v._doc).reduce((prev,curr) => Number(curr.receivedAmount)+prev,0)

	// TASK
	if (body.taskID) {
		task = await Tasks.findOne({_id: body._taskID ?? body._id})
		if(!task)
			throw new Error("Linked task not found - contact admin")

		task = task?._doc
		let totalAmount = calculateTotal(task)

		_ = await Tasks.updateOne(
			{_id: body._taskID}, 
			{
				receivedAmount: paymentAmount,
				balanceAmount: totalAmount - paymentAmount
			})

	} 

	// PACKAGE
	else if (body.packageID) {
		package = await Packages.findOne({_id: body._packageID ?? body._id})
		if(!package)
			throw new Error("Linked package not found - contact admin")

		package = package?._doc

		_ = await Packages.updateOne(
			{_id: body._packageID}, 
			{
				receivedAmount: paymentAmount,
				balanceAmount: package.due - paymentAmount
			})
	}

	await updateClient(body.clientID)

}

const updateClient = async (clientID) => {

	// CLIENT AMOUNTS

	let packageAmount = 0
	let taskAmount = 0

	let paymentAmount = 0

	let payments = await Payments.find({clientID})
	if (payments.length)
		paymentAmount = payments.map(v => v._doc).reduce((prev,curr) => Number(curr.receivedAmount)+prev,0)

	let packages = await Packages.find({clientID})
	if (packages.length)
		packageAmount = packages.map(v => v._doc).reduce((prev,curr) => (Number(curr.due) || 0)+prev,0)

	let tasks = await Tasks.find({clientID})
	if (tasks.length)
		taskAmount = tasks.map(v => v._doc).reduce((prev,curr) => calculateTotal(curr)+prev,0)

	let client = await Clients.findOne({clientID})
	if(!client)
		throw new Error("Linked client not found - contact admin")
	client = client?._doc

	// console.log(paymentAmount, packageAmount, taskAmount)
	// console.log({clientID},{
	// 	receivedAmount: paymentAmount,
	// 	balanceAmount: (packageAmount + taskAmount) - paymentAmount,
	// })

	await Clients.updateOne({clientID}, {
		receivedAmount: paymentAmount,
		balanceAmount: (packageAmount + taskAmount) - paymentAmount,
		totalAmount: (packageAmount + taskAmount),
	})
}

module.exports = {handlePayment, calculateTotal, updateClient}