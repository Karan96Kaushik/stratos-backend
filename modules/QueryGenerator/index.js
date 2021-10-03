const generateSearch = require("./generateSearch")

class QueryGenerator {

	_query = {}

	constructor (req, model, options) {

		this.req = req
		this.model = model
		this.options = options

		this._query = {
			$and:[],
		}

		if(this.req.query.text) {
			this._query.$and.push({
				$or: generateSearch(this.req.query.text, model)
			})
		}

	}

	get query() {
		if(this.options.debug)
			console.log(JSON.stringify(this._query, null, 4))

		if(!this._query.$and.length)
			delete this._query.$and
		
		return this._query

	}

	applyFilters () {

		// add filters to the query, if present
		Object.keys(this.req.query.filters ?? []).forEach(filter => {

			if(filter == "balanceStatus") {
				if(this.req.query.filters[filter] == "Nil") 
					this._query['$and'].push({
						balanceAmount: {$lte:0}
					})
				else if(this.req.query.filters[filter] == "Pending") 
					this._query['$and'].push({
						balanceAmount: {$gt:0}
					})

				return
			}

			// multi select filters
			if(this.req.query.filters[filter].multiSelect) {
				this._query['$and'].push({
					[filter]: {
						$in: this.req.query.filters[filter].values
					}
				})
			}
			// filter is range - date/number
			else if(this.req.query.filters[filter].range) {
				this.req.query.filters[filter].values.forEach((val,i) => {
					if(val == null)
						return

					let operator = i == 0 ? "$lt" : "$gt"
					this._query['$and'].push({
						[filter]: {
							[operator]: val
						}
					})	
				})
			} 
			// filter is normal value
			else {
				this._query['$and'].push({
					[filter]: this.req.query.filters[filter]
				})	
			}
		})

	}

	setArchived () {

		// search only the non-archived tasks if not specified exclusively
		if(!this.req.query.filters.archived)
			this._query['$and'].push({
				archived:false
			})
		delete this.req.query.filters.archived

	}

	setServiceType () {

		// search only the tasks that are permitted
		if(!this.req.query.serviceType)
			this._query['$and'].push({'$or':
				this.req.permissions.service.map((svc) => ({
					serviceType: svc
				}))
			})

		if(!this.req.query.searchAll)
			this._query['$and'].push({
				serviceType: this.req.query.serviceType
			})

	}

	setAddedBy (permission) {

		if (this.req.permissions.page.includes(permission) || this.req.query.ignorePermissions)
			return

		if (permission == "Tasks R")
			return this._query.$and.push({
				$or: [
					{addedBy: this.req.user.id},
					{_memberID: this.req.user.id},
					{_membersAssigned: this.req.user.id},
				]
			})

		this._query.$and.push(
			{ addedBy: this.req.user.id }
		)

	}

	setSearchAll (typeField) {

		if(this.req.query.searchAll)
			return

		this._query.$and.push({ 
			[typeField]: this.req.query[typeField] 
		})

	}

}

module.exports = {
	QueryGenerator
}