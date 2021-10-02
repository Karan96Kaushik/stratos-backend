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

	
}

const generateSearch = (model, text) => {
	return modelFunctions[model](text)
}

module.exports = generateSearch