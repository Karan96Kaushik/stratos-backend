const moment = require("moment");
const {Packages} = require("../models/Packages");

const services = [
    // 'Consultation',
    'Site Updation',
    // 'Proof Reading',
    // 'Legal Documents',
    'Form 1',
    'Form 2',
    'Form 2A',
    'Form 3',
    // 'Form 5',			// Yearly
    'Format D',
    'Disclosure of Sold',
    'Cersai Undertaking',
    // 'Other Services', 
]

const servicesYearly = ['Form 5']

const getQuarters = (startDate) => {
	const quarters = [2,5,8,11]
	const checkDate = new Date
	checkDate.setUTCHours(0,0,0,0)
	checkDate.setDate(1)
	const dates = []
	while (startDate < checkDate) {
		if (quarters.includes(checkDate.getMonth()))
			dates.push(new Date(checkDate))
		checkDate.setMonth(checkDate.getMonth() - 1)
	}
	return dates
}

const getYears = (startDate) => {
	const checkDate = new Date
	checkDate.setUTCHours(0,0,0,0)
	checkDate.setDate(1)
	checkDate.setMonth(0)
	const dates = []
	while (startDate < checkDate) {
		dates.push(new Date(checkDate))
		checkDate.setMonth(checkDate.getMonth() - 12)
	}
	return dates
}

const serviceMapping = (package, isTable) => {
	let startDate = new Date(package.startDate)
	let serviceStatus = {}
	let quarters 	= getQuarters(startDate)
	let years 		= getYears(startDate)
	
	// Quarterly Services
	services.forEach(s => {
		if (package[s]) {
			serviceStatus[s] = quarters.map(q => ({date: q, pending:!(package?.completed?.[s] ?? []).includes(q.toISOString())}))
		}
	});

	// Yearly Services
	servicesYearly.forEach(s => {
		if (package[s]) {
			serviceStatus[s] = years.map(y => ({date: y, pending:!(package?.completed?.[s] ?? []).includes(y.toISOString())}))
		}
	})

	return serviceStatus
}

const lastUpdatedMapping = (package) => {
	let startDate = new Date(package.startDate)
	let serviceStatus = {}
	let quarters 	= getQuarters(startDate)
	let years 		= getYears(startDate)
	
	// Quarterly Services
	services.forEach(s => {
		if (package[s]) {
			serviceStatus[s] = package.lastUpdated?.[s] ?? '-'
		}
		else {
			serviceStatus[s] = 'N' 
		}
	});

	// Yearly Services
	servicesYearly.forEach(s => {
		if (package[s]) {
			serviceStatus[s] = package.lastUpdated?.[s] ?? '-'
		}
		else {
			serviceStatus[s] = 'N' 
		}
	});

	return serviceStatus
}

const updatePackage = async (package) => {

	let startDate = new Date(package.startDate)

	let additiveMonths

	switch (package.paymentCycle) {
		case 'Yearly':
			additiveMonths = 12
			break;
		case 'Half Yearly':
			additiveMonths = 6
			break;
		case 'Quarterly':
			additiveMonths = 3
			break;
	}

	let checkDate = new Date

	if (package.endDate)
		checkDate = new Date(package.endDate)

	// Adding 12 hours to compensate for server time in GMT
	checkDate = new Date(+checkDate + (12 * 60 * 60 * 1000))

	let cyclesPassed = 0
	checkDate.setMonth(checkDate.getMonth() - additiveMonths)
	while (startDate < checkDate) {
		cyclesPassed++
		checkDate.setMonth(checkDate.getMonth() - additiveMonths)
	}

	// Map pending services in an array to be queried
	const packageServices = serviceMapping(package)
	let pending = []
	Object.keys(packageServices).forEach(s => packageServices[s].find(v => v.pending) && pending.push(s))

	let due = ((Number(package.amount) / (12 / additiveMonths)) * (1 + cyclesPassed))

	let gstamount = null

	if(package.gstEnabled) {
		gstamount = Math.ceil((due * 0.18))
		due = due + gstamount
	}

	let _ = await Packages.updateOne(
		{ _id: String(package._id) },
		{
			due,
			balanceAmount: due - (package.receivedAmount || 0),
			pending,
			gstamount
		}
	)
}

let getDiffDays = (a, b) => Math.round( (+b - +a) / (1000*60*60*24) )

// Map flag colors according to days passed since the service was last updated
const mapFlags = p => {
	services.forEach(s => {

		if ((new Date(p[s]) + "") == "Invalid Date")
			return

		const lastUpd = getDiffDays(new Date(p[s]), new Date)

		p[s + "Color"] = 0
		if (lastUpd >= 90 && lastUpd < 180)
			p[s + "Color"] = 1
		else if (lastUpd >= 180)
			p[s + "Color"] = 2

	})

	return p
}

// Change format of dates to DD-MM-YYYY
const formatDates = p => {
	services.forEach(s => {
		if ((new Date(p[s]) + "") == "Invalid Date")
			return
		p[s] = moment(new Date(p[s])).format("DD-MM-YYYY")
	})

	servicesYearly.forEach(s => {
		if ((new Date(p[s]) + "") == "Invalid Date")
			return
		p[s] = moment(new Date(p[s])).format("DD-MM-YYYY")
	})

	// followup duration color coding
	let followupDateColor = +new Date(p.followupDate) - +new Date()
	if(followupDateColor < 0)										// follow up date passed
		p.followupDateColor = 2

	// followup duration color coding
	let paymentDateColor = +new Date(p.paymentDate) - +new Date()
	if(paymentDateColor < 0)										// payment date passed
		p.paymentDateColor = 2


	p.createdTime = moment(new Date(p.createdTime)).format("DD-MM-YYYY")
	if (p.startDate)
		p.startDate = moment(new Date(p.startDate)).format("DD-MM-YYYY")
	if (p.endDate)
		p.endDate = moment(new Date(p.endDate)).format("DD-MM-YYYY")
	if (p.followupDate)
		p.followupDate = moment(new Date(p.followupDate)).format("DD-MM-YYYY")
	if (p.paymentDate)
		p.paymentDate = moment(new Date(p.paymentDate)).format("DD-MM-YYYY")

	return p
}

module.exports = { serviceMapping, updatePackage, lastUpdatedMapping, mapFlags, formatDates }




