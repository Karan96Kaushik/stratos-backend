const requiredConsentLetters = [
	"letterConsent",
	"letterFormB",
	"letterDisclosureOfInventory",
	"letterForm1",
	"letterForm2",
	"letterForm3",
	"letterForm2A",
	"letterForm5",
]

const excludedStatusesRfS = [
	"Desk 1",
	"Desk 2",
	"Desk 3",
	"Desk 4",
	"Certificate Generated",
	"On Hold",
	"Awaiting Accounts Confirmation"
]

const excludedStatusesRfSP = [
	"Desk 3",
	"Desk 4",
	"Certificate Generated",
	"On Hold",
	"Awaiting Accounts Confirmation"
]
const checkReadyForSubmission = (serviceType, task) => {
	let foundPromoterSignPending = false
	if (serviceType !== "Extension" && serviceType !== "Order No 40")
		return "-"
	// if (excludedStatuses.includes(task.status))
	// 	return "No"
	for (let letter of requiredConsentLetters) {
		// console.log(letter, task[letter])
		if (task[letter] !== "Received" && task[letter] !== "Promoter Sign Pending") {
			return "No"
		}
		if (task[letter] === "Promoter Sign Pending") {
			foundPromoterSignPending = true
		}
	}
	
	if (foundPromoterSignPending) {
		if (excludedStatusesRfSP.includes(task.status))
			return "No"
		else
			return "Promoter Sign Pending"
	}
	else {
		if (excludedStatusesRfS.includes(task.status))
			return "No"
		else
			return "Yes"
	}
}

module.exports = {
	checkReadyForSubmission
}
