/** Due Updation Cron

	- Update package dues according to start date
	- [Maybe] Update pending services according to  
*/

require('../scripts/db')
const { Packages } = require("../models/Packages");
const {serviceMapping} = require('../modules/packageHelpers')

const updatePackages = async () => {

	let allPackages = await Packages.find()

	console.log(allPackages.length)

	for (package of allPackages) {

		package = package._doc

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

		let due = (package.amount / (12 / additiveMonths)) * cyclesPassed

		let _ = await Packages.updateOne(
			{ _id: String(package._id) },
			{
				due,
				pending
			}
		)

	}

	console.log("Done")
	process.exit(0)
}

updatePackages()