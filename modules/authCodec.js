/** 
	CAUTION: Add new permissions at the end of the array
*/
const pagePermissions = [
	"-",			// "-" to preserve if there is a leading 0 ( eg. 01101 == 1101 == 13)
	"leadsr",
	"leadsw",
	"clientsr",
	"clientsw",
	"membersr",
	"membersw",
]

let servicePermissions = [
	"-",
	"agentregistration",
	"projectregistration",
]

/**
	CAUTION: Add new permissions at the end of the array
*/

const encodeAuth = (permissions) => {

	let pagePermissionsCopy = [...pagePermissions]
	let servicePermissionsCopy = [...servicePermissions]

	// Remove the leading "-"
	pagePermissionsCopy.shift()			
	servicePermissionsCopy.shift()

	let permissionBinPage = pagePermissionsCopy.map(p => permissions.includes(p) ? 1 : 0)
	let permissionBinService = servicePermissionsCopy.map(p => permissions.includes(p) ? 1 : 0)

	// Always lead with 1 for "-"
	permissionBinPage = "1" + permissionBinPage.join("") 
	permissionBinService = "1" + permissionBinService.join("")

	return {
		page: parseInt(permissionBinPage, 2),
		service: parseInt(permissionBinService, 2),
	}
}

const decodeAuth = (permissionsObj) => {

	if(!permissionsObj.page || !permissionsObj.service)
		return {page:[], service:[]}

	let permissions = Object.assign({}, permissionsObj)

	permissions.page = permissions.page.toString(2)
	permissions.service = permissions.service.toString(2)

	permissions.page = permissions.page.split("")
	permissions.service = permissions.service.split("")

	permissions.service = permissions.service.map((val, idx) => (val === "1" ? servicePermissions[idx] : null))
	permissions.page = permissions.page.map((val, idx) => (val === "1" ? pagePermissions[idx] : null))

	permissions.service = permissions.service.filter(Boolean)
	permissions.page = permissions.page.filter(Boolean)

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

