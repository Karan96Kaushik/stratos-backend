/** 
	CAUTION: Add new permissions at the end of the array
*/
const pagePermissions = [
	"-",			// "-" to preserve if there is a leading 0 ( eg. 01101 == 1101 == 13)
	"Leads R",
	"Leads W",
	"Clients R",
	"Clients W",
	"Members R",
	"Members W",
	"Quotations R",
	"Quotations W",
	"Invoices R",
	"Invoices W",
	"Tasks R",
	"Tasks W",
	"Payments R",
	"Payments W",
	"Packages R",
	"Packages W",
	"Packages Services R",
	"Packages Services W",
	"Packages Accounts R",
	"Packages Accounts W",
	"Assigned Task Accounts R",
	"Leads R Servicewise",
	"Tickets R",
	"Tickets W",
	"Sales R",
	"Sales W",
	"Approve Meetings",
	"CC Received R",
	"CC Received W",
]

let servicePermissions = [
	"-",
	"Agent Registration",
	"Project Registration",
	"Extension",
	"Correction",
	"Form 5 - Audit",
	"Form 2A",
	"Updation",
	"Form 1",
	"Form 2",
	"Form 3",
	"Others - Tech",
	"Title Certificate",
	"Agreement for Sale Draft",
	"Litigation",
	"Hourly Package",
	"Legal Notice",
	"Registration",
	"Drafting of Documents",
	"Others - Legal",
    "Change of Promoter",
    "Project Closure",
    "De-Registration",
    "Order No 40",
 ]

 const systemPermissions = [
	'-',
    "View RERA Passwords",
	"Update Admin Settings",
	"Remote Access",
]

/**
	CAUTION: Add new permissions at the end of the array
*/

const encodeAuth = (permissions) => {

	let pagePermissionsCopy = [...pagePermissions]
	let servicePermissionsCopy = [...servicePermissions]
	let systemPermissionsCopy = [...systemPermissions]

	// Remove the leading "-"
	pagePermissionsCopy.shift()			
	servicePermissionsCopy.shift()
	systemPermissionsCopy.shift()

	let permissionBinPage = pagePermissionsCopy.map(p => permissions.includes(p) ? 1 : 0)
	let permissionBinService = servicePermissionsCopy.map(p => permissions.includes(p) ? 1 : 0)
	let permissionBinSystem = systemPermissionsCopy.map(p => permissions.includes(p) ? 1 : 0)

	// Always lead with 1 for "-"
	permissionBinPage = "1" + permissionBinPage.join("") 
	permissionBinService = "1" + permissionBinService.join("")
	permissionBinSystem = "1" + permissionBinSystem.join("")

	return {
		page: parseInt(permissionBinPage, 2),
		service: parseInt(permissionBinService, 2),
		system: parseInt(permissionBinSystem, 2),
	}
}

const decodeAuth = (permissionsObj) => {

	if(!permissionsObj.page && !permissionsObj.service && !permissionsObj.system)
		return {page:[], service:[], system:[]}

	let permissions = Object.assign({}, permissionsObj)

	permissions.page = permissions.page.toString(2)
	permissions.service = permissions.service.toString(2)
	permissions.system = permissions?.system?.toString(2) || '1'

	permissions.page = permissions.page.split("")
	permissions.service = permissions.service.split("")
	permissions.system = permissions.system.split("")

	permissions.service = permissions.service.map((val, idx) => (val === "1" ? servicePermissions[idx] : null))
	permissions.page = permissions.page.map((val, idx) => (val === "1" ? pagePermissions[idx] : null))
	permissions.system = permissions.system.map((val, idx) => (val === "1" ? systemPermissions[idx] : null))

	permissions.service = permissions.service.filter(Boolean)
	permissions.page = permissions.page.filter(Boolean)
	permissions.system = permissions.system.filter(Boolean)

	return permissions
}

// test = [
// 	"projectregistration",
// ]

// console.time("TEST")
// e = encodeAuth(test)
// console.log(e)
// console.timeEnd("TEST")

// console.time("TEST")
// console.log(decodeAuth(e))
// console.timeEnd("TEST")

module.exports = {
	encodeAuth,
	decodeAuth
}

