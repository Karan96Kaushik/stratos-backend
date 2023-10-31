/** Due Updation Cron

	- Update package dues according to start date
	- Update pending services according to  
*/

require('../scripts/db')
const { Packages } = require("../models/Packages");
const { updatePackage } = require('../modules/packageHelpers')

const updatePackages = async () => {

	let allPackages = await Packages.find()

	console.log(allPackages.length + ' packages found')

	for (let package of allPackages) {
		try {
			package = package._doc
			if (!package.startDate || !package.paymentCycle)
				continue
			await updatePackage(package)
		}
		catch (err) {
			console.error("Error in package", package)
			console.error(err)
		}
	}

	console.log("Done")
	process.exit(0)
}

updatePackages()