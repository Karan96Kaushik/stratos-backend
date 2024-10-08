// import taskFields from "./taskFields"

const memberFields = {
        texts:[
            {label:"Member ID", id:"memberID", isRequired:true},
            {label:"Name", id:"userName", isRequired:true},
            {label:"Username", id:"email", isRequired:true},
            // {label:"Password", id:"password", hideEdit:false, isRequired:true},
            {label:"Mobile", id:"phone", isRequired:true},
            {label:"Designation", id:"designation", isRequired:true},
            {label:"Department", id:"department", isRequired:true},
            {label:"Branch", id:"branch", isRequired:true},
            {label:"Address", id:"address", isRequired:true},
            {label:"Emergency Contact", id:"emergencyContact", isRequired:true},
            {label:"Blood Group", id:"bloodGroup", isRequired:true},
            {label:"Start Date", id:"startDate", type:"date", isRequired:true},
            {label:"End Date", id:"endDate", type:"date"},
            {label:"Remarks", id:"remarks"},
            // {label:"Files", id:"files", type:"file"},
        ],
        checkboxes:[
        ]
    }

const pagePermissionFields = [
    "Members R",
    "Members W",
    "Clients R",
    "Clients W",
    "Leads R",
    "Leads W",
    "Quotations R",
    "Quotations W",
    "Invoices R",
    "Invoices W",
    "Tasks R",
    "Tasks W",
    "Payments R",
    "Payments W",
]

// const servicePermissionFields = Object.keys(taskFields)

module.exports = {
    // pagePermissionFields,
    // servicePermissionFields,
    memberFields
}