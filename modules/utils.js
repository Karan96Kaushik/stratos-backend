class QueryGenerator {

	query = {}

	constructor (req) {
		this.req = req

		this.query = {
			$and:[],
		}

		if(this.req.query.text) {
			this.query.$and.push({
				$or:[
					{ name: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ taskID: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ clientName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ membersAssigned: { $regex: new RegExp(req.query.text) , $options:"i" }},
					// { memberName: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ promoter: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ totalAmount: Number(req.query.text)},
					{ billAmount: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ ca: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ engineer: { $regex: new RegExp(req.query.text) , $options:"i" }},
					{ status: { $regex: new RegExp(req.query.text) , $options:"i" }},
				]
			})
		}

	}

	applyFilters () {

		// add filters to the query, if present
		Object.keys(this.req.query.filters ?? []).forEach(filter => {

			if(filter == "balanceStatus") {
				if(this.req.query.filters[filter] == "Nil") 
					this.query['$and'].push({
						balanceAmount: {$lte:0}
					})
				else if(this.req.query.filters[filter] == "Pending") 
					this.query['$and'].push({
						balanceAmount: {$gt:0}
					})

				return
			}
			// filter is range - date/number
			if(typeof this.req.query.filters[filter] == "object") {
				this.req.query.filters[filter].forEach((val,i) => {
					if(val == null)
						return

					let operator = i == 0 ? "$lt" : "$gt"
					this.query['$and'].push({
						[filter]: {
							[operator]: val
						}
					})	
				})
			} 
			// filter is normal value
			else {
				this.query['$and'].push({
					[filter]: this.req.query.filters[filter]
				})	
			}
		})

	}

	setArchived () {

		// search only the non-archived tasks if not specified exclusively
		if(!this.req.query.filters.archived)
			this.query['$and'].push({
				archived:false
			})
		delete this.req.query.filters.archived

	}

}

module.exports = {
	QueryGenerator
}