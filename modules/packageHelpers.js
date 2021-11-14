const services = [
    'Consultation',
    'Site Updation',
    'Proof Reading',
    'Legal Documents',
    'Form 1',
    'Form 2',
    'Form 2A',
    'Form 3',
    'Form 5',
    'Format D',
    'Disclosure of Sold',
    // 'Other Services', 
]

const getQuarters = (startDate) => {
	const quarters = [1,4,7,10]
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

const serviceMapping = (package, isTable) => {
	let startDate = new Date(package.startDate)
	let serviceStatus = {}
	let quarters = getQuarters(startDate)

	services.forEach(s => {
		if (package[s]) {
			serviceStatus[s] = quarters.map(q => ({date: q, pending:!(package?.completed?.[s] ?? []).includes(q.toISOString())}))
			if (isTable)
				serviceStatus[s] = serviceStatus[s].find(v => v.pending) ? 'Pending' : ''
				// serviceStatus[s] = serviceStatus[s].map((q) => moment(q.date).format('MMM-YY')).join('\n')
		}
	})
	return serviceStatus
}

module.exports = { serviceMapping }