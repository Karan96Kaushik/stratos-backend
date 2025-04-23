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
const {Packages} = require("../models/Packages");
const {HearingDates} = require('../models/HearingDates');
const {handlePayment} = require("../modules/paymentHelpers");
const {Sales} = require('../models/Sales');
const {Meetings} = require('../models/Meetings');
const {Procurements} = require('../models/Procurements');

const { checkReadyForSubmission } = require("../modules/taskHelpers");

const moment = require('moment');


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

const fixClientNames = async () => {

	let allClients = await Clients.find()
	console.log(allClients.length)

	for (client of allClients) {

		client = client._doc

		let _ = await Tasks.updateMany(
			{ _clientID: String(client._id) },
			{
				clientName:client.name,
				promoter:client.promoter
			}
		)

		_ = await Packages.updateMany(
			{ _clientID: String(client._id) },
			{
				clientName:client.name,
				promoter:client.promoter
			}
		)

		console.log(client.name)

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
		console.log(task.taskID)

		let amount = calculateTotal(task)

		// let _ = await Tasks.updateOne(
		// 	{_id: String(task._id)}, 
		// 	{
		// 		receivedAmount: 0,
		// 		totalAmount: amount,
		// 		balanceAmount: amount,
		// 	}
		// )
		console.log(amount)

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

const migratePackagesArchived = async () => {
	let _ = await Packages.updateMany(
		{}, 
		{
			archived: false
		}
	)

	console.log("Done")
}

const migrateTasksRemoveFromAccounts = async () => {
	let _ = await Tasks.updateMany(
		{}, 
		{
			removeFromAccounts: false
		}
	)

	console.log("Done")
}

const migrateClientAmounts = async () => {

	let allClients = await Clients.find()

	for (client of allClients) {

		let tasks = await Tasks.find({clientID: client.clientID})
		let packages = await Packages.find({clientID: client.clientID})
		tasks = tasks.map(t => t._doc)
		packages = packages.map(p => p._doc)
		if(!tasks.length && !packages.length)
			continue

		let totalAmount = tasks.reduce((t, curr) => Number(curr.totalAmount || 0) + t,0)
		let totalAmountP = packages.reduce((t, curr) => Number(curr.totalAmount || 0) + t,0)
		totalAmount = totalAmount + totalAmountP
		let receivedAmount = tasks.reduce((t, curr) => Number(curr.receivedAmount || 0) + t,0)
		let receivedAmountP = packages.reduce((t, curr) => Number(curr.receivedAmount || 0) + t,0)
		receivedAmount = receivedAmount + receivedAmountP
		let balanceAmount = tasks.reduce((t, curr) => Number(curr.balanceAmount || 0) + t,0)
		let balanceAmountP = packages.reduce((t, curr) => Number(curr.balanceAmount || 0) + t,0)
		balanceAmount = balanceAmount + balanceAmountP
		
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

const fixTasks = async () => {

	let allTasks = await Tasks.find()

	console.log(allTasks.length)

	for (task of allTasks) {

		task = task._doc
		if(!task.clientID)
			console.log(task)

		let newBalance = 0
		let totalPayments = 0

		let payments = await Payments.find({taskID: task.taskID})
		if(!payments.length && task.totalAmount > task.balanceAmount) {
			console.log("no payments", task.taskID, task.totalAmount, task.balanceAmount)
			newBalance = task.totalAmount
		} 
		else if (!payments.length && task.receivedAmount == 0 && !isNaN(task.balanceAmount)) {
			continue
		}
		else {
			totalPayments = payments.map(v => v._doc).reduce((prev,curr) => Number(curr.receivedAmount)+prev,0)
			if(typeof totalPayments == 'string')
				console.log(payments)
			if (totalPayments != (task.totalAmount - task.balanceAmount)) {
				console.log("uneq pmt", task.taskID, totalPayments, task.totalAmount - task.balanceAmount)
				newBalance = (task.totalAmount || 0) - (totalPayments || 0)
			} else {
				continue
			}
		}

		let _ = await Tasks.updateOne(
			{_id: String(task._id)}, 
			{
				balanceAmount: newBalance,
				receivedAmount: totalPayments
			}
		)

		await handlePayment(task)
		console.log(task.taskID)

	}

	console.log("Done")
}

// Fix Payments datatype
const fixPayments = async () => {

	let allPayments = await Payments.find()

	console.log(allPayments.length)

	for (payment of allPayments) {

		payment = payment._doc

		console.log(payment.receivedAmount)

		// let _ = await Payments.updateOne(
		// 	{_id: String(payment._id)}, 
		// 	{
		// 		receivedAmount: Number(payment.receivedAmount)
		// 	}
		// )

	}

	console.log("Done")
}

const fixPackages = async () => {

	let allPackages = await Packages.find()

	console.log(allPackages.length)

	for (package of allPackages) {

		package = package._doc
		if(!package.clientID)
			console.log(package)

		let newBalance = 0

		let payments = await Payments.find({packageID: package.packageID})
		if(!payments.length && package.due > package.balanceAmount) {
			console.log("no payments", package.packageID, package.due, package.balanceAmount)
			newBalance = package.due
		} 
		else if (!payments.length) {
			continue
		}
		else {
			let totalPayments = payments.map(v => v._doc).reduce((prev,curr) => Number(curr.receivedAmount)+prev,0)
			if(typeof totalPayments == 'string')
				console.log(payments)
			if (totalPayments != (package.due - package.balanceAmount)) {
				console.log("uneq pmt", package.packageID, totalPayments, package.due - package.balanceAmount)
				newBalance = package.due - totalPayments
			} else {
				continue
			}
		}
		console.log(package.due, newBalance)
		// let _ = await Tasks.updateOne(
		// 	{_id: String(task._id)}, 
		// 	{
		// 		balanceAmount: newBalance
		// 	}
		// )

	}

	console.log("Done")
}

const test = async () => {

	console.time("JKSHAJKHS")

	// SELECT * FROM Clients
	// INNER JOIN Tasks On Clinets._id = Tasks._clientID;

	let data = await Clients.aggregate(
		[
			{
				$lookup: {
					from: "Tasks",
					localField:"_id",
					foreignField:"_clientID",
					as: "Tasks"
				}
			},
			{ $match: { Tasks:  { $gte: { $size: 1 }}} },
			{ $project: { 
					clientID: 1,
					totalAmount: 1,
					Total: { $sum: "$Tasks.totalAmount" }
				}
			},
		])

	console.log(data)

	console.timeEnd("JKSHAJKHS")
}

const checkIdDuplicates = async () => {

	console.time("JKSHAJKHS")

	let data = await Payments.aggregate(
		[
			{
				$group: {
					_id: '$taskID',
					count: { $count: { } },
				}
			},
		    {
		       $match: { "count": { $gt: 1 } }
		    }
		])

	console.log(data)

	console.timeEnd("JKSHAJKHS")
}

const migrateHearingDate = async () => {
	let tasks = await Tasks.find({hearingDate: {$exists:true}})
	for (let task of tasks) {
		task = task._doc
		console.log(task.taskID, task.hearingDate)
		await Tasks.updateOne(
			{_id: String(task._id)}, 
			{
				hearingDetails: task.hearingDate, 
				$unset: {hearingDate: ''}
			}
		)
	}
	console.log('Done')
}


const fixHearingDate = async () => {
	let hDates = await HearingDates.find()
	for (let hDate of hDates) {
		hDate = hDate._doc

		hDate.title = hDate.title.split(' ').filter(Boolean).join(' ')
		hDate.title = hDate.title.replace(/\t/g, ' ')
		hDate.title = hDate.title.replace(/\n/g, ' ')

		console.log(hDate.title, hDate.hearingDate)
		await HearingDates.updateOne(
			{_id: String(hDate._id)}, 
			{
				title: hDate.title
			}
		)
	}
	console.log('Done')
}

const migratePaymentsServicetype = async () => {

	// let allPackages = await Packages.find()
	let allPayments = await Payments.find()

	console.log(allPayments.length)

	for (payment of allPayments) {

		// let package = allPackages.find(val => String(val.packageID) == String(payment.packageID))
		if(!payment._doc.packageID) {
			// console.log(String(payment))
			continue
		}
		// console.log('.')

		let _ = await Payments.updateOne(
			{_id: String(payment._id)}, 
			{
				// clientName: task.clientName,
				serviceType: "Package"
			}
		)
		// console.log(_)

	}

	console.log("Done")
}

const migrateDepartments = async () => {

	let departments = [
		'Admin', 
		'Operations', 
		'Technical',
		'Accounts',
		'Relationship Manager',
		'Sales',
	]

	let departmentsNew = [
		'Administration', 
		'Compliance', 
		'Registration',
		'Finance',
		'Client Retention',
		'Business Development',
	]

	for (dep of departments) {
		console.debug(dep, departmentsNew[departments.indexOf(dep)])
		let _ = await Members.updateMany(
			{department: dep}, 
			{department: departmentsNew[departments.indexOf(dep)]}, 
		)

	}

	console.log("Done")
}

const migrateMembersUnread = async () => {
	console.log(await Members.updateMany({}, {unread:0}))
	console.debug('Done')
}

const migrateCallingDate = async () => {
	let sales = await Sales.find()
	for (let sale of sales) {
		sale = sale._doc
		// console.log(task.taskID, task.hearingDate)
		await Sales.updateOne(
			{_id: String(sale._id)}, 
			{
				callingDate: sale.followUpDate, 
				// $unset: {hearingDate: ''}
			}
		)
	}
	console.log('Done')
}

const migrateSalesRemarks = async () => {

	await Sales.updateMany(
		{ remarks: { $type: "string" } }, // Filter to find the specific user where remarks is a string
		[
		{
			$set: {
			remarks: {
				$cond: {
				if: { $eq: [{ $type: "$remarks" }, "string"] },
				then: ["$remarks"], // Convert string to array with the string inside it
				else: "$remarks"
				}
			}
			}
		}
		])
	console.log('done')
}

const migrateCallingDateType = async () => {

	await Sales.updateMany(
		{ callingDate: { $type: "string" } }, // Filter to find all documents where callingDate is a string
		[
		{
			$set: {
			callingDate: {
				$cond: {
				if: { $eq: [{ $type: "$callingDate" }, "string"] },
				then: { $toDate: "$callingDate" }, // Convert string to Date
				else: "$callingDate"
				}
			}
			}
		}
		])

	console.log('done')
}

const migrateTasksAddedBy = async () => {

	let allMembers = await Members.find()
	let allTasks = await Tasks.find({})

	console.log(allTasks.length)

	for (task of allTasks) {

		let member = allMembers.find(val => String(val._id) == String(task.addedBy))
		if(!member) {
			console.log(String(task.addedBy))
			continue
		}

		// console.log({_id: String(task._id)}, {memberName: member.userName})
		let _ = await Tasks.updateOne(
			{_id: String(task._id)}, 
			{addedByName: member.userName}
		)
		// console.log(_)

	}

	console.log("Done")
}

const migrateRemarksToArray = async () => {
	try {
	  const result = await Tasks.updateMany(
		{ remarks: { $type: "string" } }, // Filter to find all documents where remarks is a string
		[
		  {
			$set: {
			  remarks: {
				$cond: {
				  if: { $eq: [{ $type: "$remarks" }, "string"] },
				  then: [{ $ifNull: ["$remarks", ""] }], // Convert string to array with the string as its only element
				  else: "$remarks" // Keep as is if it's already an array or another type
				}
			  }
			}
		  }
		]
	  );
  
	  console.log('Migration completed.', result);
	  console.log(`Matched ${result.matchedCount} documents.`);
	  console.log(`Modified ${result.modifiedCount} documents.`);
	} catch (error) {
	  console.error('Error during migration:', error);
	}
  };

  const migrateSalesToMeetings = async () => {
	try {
	  // Find all Sales documents with a meetingDate
	  const salesWithMeetings = await Sales.find({ meetingDate: { $exists: true, $ne: null } });
  
	  console.log(`Found ${salesWithMeetings.length} Sales documents with meetings.`);
  
	  let createdCount = 0;
	  let errorCount = 0;
  
	  for (let sale of salesWithMeetings) {
		try {
		  // Create a new Meeting document
		  sale = sale._doc
		  const newMeeting = new Meetings({
			title: sale.salesID + ' - ' +  sale.promoterName  + " - Meeting",
			meetingDate: sale.meetingDate,
			remarks: '', // Initialize with an empty string
			addedBy: sale.addedBy,
			_membersAssigned: sale._membersAssigned,
			membersAssigned: sale.membersAssigned,
			meetingStatus: sale.meetingStatus,
			_salesID: sale._id,
			salesID: sale.salesID
		  });
  
		  // Save the new Meeting document
		  await newMeeting.save();
  
		  createdCount++;
		} catch (error) {
		  console.error(`Error creating meeting for Sale ${sale._id}:`, error);
		  errorCount++;
		}
	  }
  
	  console.log(`Migration completed.`);
	  console.log(`Created ${createdCount} new Meeting documents.`);
	  console.log(`Encountered errors for ${errorCount} documents.`);
	} catch (error) {
	  console.error('Error during migration:', error);
	}
  };

const migrateRegistrationTeams = async () => {
  try {
    const result = await Tasks.updateMany(
      { 
        serviceType: "Project Registration",
        team: { $exists: false }
      },
      { 
        $set: { team: "Registration 1" }
      }
    );

    console.log(`Modified ${result.nModified} documents.`);
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

const updateInvoiceFroms = async () => {
	let allInvoices = await Invoices.find({from: "RERA Easy Consultancy"})
	for (invoice of allInvoices) {
		invoice = invoice._doc
		invoice.from = invoice.from = "REC - Not to Use"
		console.log(invoice.invoiceID)
		await Invoices.updateOne({_id: String(invoice._id)}, invoice)
	}
	console.log('Done', allInvoices.length)
}

const migratePackageAccountsRemarks = async () => {

	await Packages.updateMany(
		{ remarks: { $type: "string" } }, // Filter to find the specific user where remarks is a string
		[
		{
			$set: {
			remarks: {
				$cond: {
				if: { $eq: [{ $type: "$remarks" }, "string"] },
				then: ["$remarks"], // Convert string to array with the string inside it
				else: "$remarks"
				}
			}
			}
		}
		])
	console.log('done')
}

const migrateTasksPaymentRemarks = async () => {

	await Tasks.updateMany(
		{ paymentRemarks: { $type: "string" } }, // Filter to find the specific user where remarks is a string
		[
		{
			$set: {
			paymentRemarks: {
				$cond: {
				if: { $eq: [{ $type: "$paymentRemarks" }, "string"] },
				then: ["$paymentRemarks"], // Convert string to array with the string inside it
				else: "$paymentRemarks"
				}
			}
			}
		}
		])
	console.log('done')
}


const migrateProcurementBillDates = async () => {

	let allProcurements = await Procurements.find()

	console.log(allProcurements.length)

	for (procurement of allProcurements) {
		procurement = procurement._doc
		// procurement.paymentDate = procurement.createdTime
		// console.log(procurement.procurementID)

		await Procurements.updateOne(
			{ _id: String(procurement._id) },
			[
				{
					$set: {
						billDate: moment(procurement.createdTime).format('YYYY-MM-DD')
					}
				}
			]
		)
		console.log(procurement.procurementID)
    }
    console.log('Updated procurement payment dates')
}


const migrateProcurementPaymentDates = async () => {

	let allProcurements = await Procurements.find()

	console.log(allProcurements.length)

	for (procurement of allProcurements) {
		// console.log(procurement.procurementID, procurement._doc?.paymentDate)
		procurement = procurement._doc
		if (procurement.paymentDate && String(procurement.paymentDate).includes('T')) {

			await Procurements.updateOne(
				{ _id: String(procurement._id) },
				[
					{
						$set: {
							paymentDate: moment(procurement.paymentDate).format('YYYY-MM-DD')
						}
					}
				]
			)

			console.log(procurement.procurementID)
		}
    }
    console.log('Updated procurement payment dates')
}

const migrateTasksReadyForSubmission = async () => {
	let allTasks = await Tasks.find({readyForSubmission: 'Yes'})
	for (task of allTasks) {
		task = task._doc
		readyForSubmission = checkReadyForSubmission(task.serviceType, task)
		console.log(task.taskID, readyForSubmission)
		// await Tasks.updateOne({_id: String(task._id)}, {readyForSubmission: readyForSubmission})
	}
	console.log('Done')
}

migrateTasksReadyForSubmission()

// migrateProcurementPaymentDates()

// migrateTasksPaymentRemarks()

// updateInvoiceFroms()

// migrateRegistrationTeams()


// migrateSalesToMeetings()

// migrateRemarksToArray()

// migrateTasksAddedBy()

// migrateCallingDateType()

// migrateSalesRemarks()

// migrateCallingDate()

// migrateMembersUnread()

// migrateDepartments()

// migratePaymentsServicetype()

// test();

// checkIdDuplicates()

// Add remove from accounts property
// migrateTasksRemoveFromAccounts()
// fixHearingDate()

// fixClientNames()

// migrateHearingDate()

// Fix tasks and packages balance amount denormalisation
// fixPackages()
// fixTasks()
// fixPayments()

// Restructure invoices to handle array of items
// 	updateInvoices()

// removeInvoices()
// migrateTaskPromoter()

// removeTasks()
// migrateClientAmounts()
// migratePackagesArchived()
// migrateTasksArchived()
// migrateTasksReceivedAmount()
// migrateQuotes()
// migrateLeads()
// migratePayments()



