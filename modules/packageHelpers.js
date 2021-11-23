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

const getQuarters = (startDate) => {
	const quarters = [3,5,9,12]
	const checkDate = new Date
	checkDate.setUTCHours(0,0,0,0)
	checkDate.setDate(1)
	const dates = []
	while (startDate < checkDate) {
		if (quarters.includes(checkDate.getMonth() + 1))
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
			if (isTable)
				serviceStatus[s] = serviceStatus[s].find(v => v.pending) ? 'Pending' : ''
				// serviceStatus[s] = serviceStatus[s].map((q) => moment(q.date).format('MMM-YY')).join('\n')
		}
	});

	// Yearly Services
	['Form 5'].forEach(s => {
		if (package[s]) {
			serviceStatus[s] = years.map(y => ({date: y, pending:!(package?.completed?.[s] ?? []).includes(y.toISOString())}))
			if (isTable)
				serviceStatus[s] = serviceStatus[s].find(v => v.pending) ? 'Pending' : ''
				// serviceStatus[s] = serviceStatus[s].map((q) => moment(q.date).format('MMM-YY')).join('\n')
		}
	})

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

	let due = (Number(package.amount) / (12 / additiveMonths)) * (1 + cyclesPassed)

	let _ = await Packages.updateOne(
		{ _id: String(package._id) },
		{
			due,
			balanceAmount: due - (package.receivedAmount || 0),
			pending
		}
	)
}

module.exports = { serviceMapping, updatePackage }