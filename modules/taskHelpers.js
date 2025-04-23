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

const excludedStatuses = [
	"Desk 1", 
	"Desk 2", 
	"Desk 3", 
	"Desk 4", 
	"Certificate Generated",
	"Awaiting Client Confirmation", 
	"Awaiting Accounts Confirmation", 
	"Hold",
	"On Hold"
]

const checkReadyForSubmission = (serviceType, task) => {
	let foundPromoterSignPending = false
	if (serviceType !== "Extension" && serviceType !== "Order No 40")
		return "No"
	if (excludedStatuses.includes(task.status))
		return "No"
	for (let letter of requiredConsentLetters) {
		// console.log(letter, task[letter])
		if (task[letter] !== "Received" && task[letter] !== "Promoter Sign Pending") {
			return "No"
		}
		if (task[letter] === "Promoter Sign Pending") {
			foundPromoterSignPending = true
		}
	}
	if (foundPromoterSignPending)
		return "Promoter Sign Pending"
	return "Yes"
}

module.exports = {
	checkReadyForSubmission
}
