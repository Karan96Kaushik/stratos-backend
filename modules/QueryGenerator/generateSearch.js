const modelFunctions = {

	Tasks: (text) => (
		[
			{ name: { $regex: new RegExp(text) , $options:"i" }},
			{ taskID: { $regex: new RegExp(text) , $options:"i" }},
			{ clientName: { $regex: new RegExp(text) , $options:"i" }},
			{ membersAssigned: { $regex: new RegExp(text) , $options:"i" }},
			// { memberName: { $regex: new RegExp(text) , $options:"i" }},
			{ promoter: { $regex: new RegExp(text) , $options:"i" }},
			{ totalAmount: Number(text)},
			{ billAmount: { $regex: new RegExp(text) , $options:"i" }},
			{ ca: { $regex: new RegExp(text) , $options:"i" }},
			{ engineer: { $regex: new RegExp(text) , $options:"i" }},
			{ status: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	TaskPayments: (text) => (
		[
			{ name: { $regex: new RegExp(text) , $options:"i" }},
			{ taskID: { $regex: new RegExp(text) , $options:"i" }},
			{ clientName: { $regex: new RegExp(text) , $options:"i" }},
			{ receivedAmount: Number(text)},
			{ balanceAmount: Number(text)},
			{ totalAmount: Number(text)},
			{ billAmount: Number(text)},
			{ promoter: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	Clients: (text) => (
		[
			{ name: { $regex: new RegExp(text) , $options:"i" }},
			{ promoter: { $regex: new RegExp(text) , $options:"i" }},
			{ location: { $regex: new RegExp(text) , $options:"i" }},
			{ userID: { $regex: new RegExp(text) , $options:"i" }},
			{ clientID: { $regex: new RegExp(text) , $options:"i" }},
			{ email: { $regex: new RegExp(text) , $options:"i" }},
			{ mobile: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	ClientPayments: (text) => (
		[
			{ name: { $regex: new RegExp(text) , $options:"i" }},
			{ promoter: { $regex: new RegExp(text) , $options:"i" }},
			{ location: { $regex: new RegExp(text) , $options:"i" }},
			{ userID: { $regex: new RegExp(text) , $options:"i" }},
			{ clientID: { $regex: new RegExp(text) , $options:"i" }},
			{ email: { $regex: new RegExp(text) , $options:"i" }},
			{ mobile: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	Invoices: (text) => (
		[
			{ invoiceID: { $regex: new RegExp(text) , $options:"i" }},
			{ memberID: { $regex: new RegExp(text) , $options:"i" }},
			{ projectName: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	Leads: (text) => (
		[
			{ leadID: { $regex: new RegExp(text) , $options:"i" }},
			{ leadResponsibility: { $regex: new RegExp(text) , $options:"i" }},
			// { memberName: { $regex: new RegExp(text) , $options:"i" }},
			{ name: { $regex: new RegExp(text) , $options:"i" }},
			// { memberID: { $regex: new RegExp(text) , $options:"i" }},
			{ projectName: { $regex: new RegExp(text) , $options:"i" }},
			{ mobile: { $regex: new RegExp(text) , $options:"i" }},
			{ email: { $regex: new RegExp(text) , $options:"i" }},
			{ location: { $regex: new RegExp(text) , $options:"i" }},
			{ companyName: { $regex: new RegExp(text) , $options:"i" }},
			{ office: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	Quotations: (text) => (
		[
			{ serviceType: { $regex: new RegExp(text) , $options:"i" }},
			{ memberName: { $regex: new RegExp(text) , $options:"i" }},
			{ quotationID: { $regex: new RegExp(text) , $options:"i" }},
			{ clientName: { $regex: new RegExp(text) , $options:"i" }},
			{ clientID: { $regex: new RegExp(text) , $options:"i" }},
			{ memberID: { $regex: new RegExp(text) , $options:"i" }},
			{ relatedProject: { $regex: new RegExp(text) , $options:"i" }},
		]
	),

	Members: (text) => (
		[
			{ email: { $regex: new RegExp(text) , $options:"i" }},
			{ userName: { $regex: new RegExp(text) , $options:"i" }},
		]
	)

}

const generateSearch = (text, model) => {
	return modelFunctions[model](text)
}

module.exports = generateSearch