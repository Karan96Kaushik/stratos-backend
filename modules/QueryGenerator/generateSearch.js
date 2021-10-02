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
	)

}

const generateSearch = (text, model) => {
	return modelFunctions[model](text)
}

module.exports = generateSearch