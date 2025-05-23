const letterOptions1 = [
    "",
    "Pending",
    "Received",
    "Error",
]

const letterOptions2 = [
    "",
    "Pending",
    "Received",
    "Error",
    "Consents not Sufficent",
]

const letterOptions3 = [
    "",
    "Pending",
    "Received",
    "Promoter Sign Pending",
    "Error",
]

const letterOptions4 = [
    "",
    "Red",
    "Yellow",
    "Green",
]

const consentLetters = [
    {label:"Extension Application", id:"letterExtensionApplication", options:letterOptions1},
    {label:"Form E", id:"letterFormE", options:letterOptions1},
    {label:"Consent Letter", id:"letterConsent", options:letterOptions1},
    {label:"Form B", id:"letterFormB", options:letterOptions1},
    {label:"Disclosure of Inventory", id:"letterDisclosureOfInventory", options:letterOptions1},
    {label:"Format D", id:"letterFormatD", options:letterOptions1},
    {label:"Form 1", id:"letterForm1", options:letterOptions3},
    {label:"Form 2", id:"letterForm2", options:letterOptions3},
    {label:"Form 3", id:"letterForm3", options:letterOptions3},
    {label:"Form 2A", id:"letterForm2A", options:letterOptions3},
    {label:"Form 5", id:"letterForm5", options:letterOptions3},
    {label:"CERSAI", id:"letterCersai", options:letterOptions1},
    {label:"Format A", id:"letterFormatA", options:letterOptions4},
    {label:"Annexure A", id:"letterAnnexureA", options:letterOptions1},
    {label:"Declaration", id:"letterDeclaration", options:letterOptions1},
    {label:"PERT", id:"letterPert", options:letterOptions1},
    {label:"No Complaints", id:"letterNoComplaints", options:letterOptions1},
    {label:"Affidavit - Allottees", id:"letterAffidavitAllottees", options:letterOptions1},
    {label:"Submission", id:"letterSubmission", options:letterOptions4},
]


const statuses = [
    "", 
    "New Task", 
    "In Progress", 
    "On Hold", 
    "Awaiting Documents from client", 
    "Awaiting Accounts Confirmation",
] 

// AR PR EX CO
const statusSet1 = [
    "Completed", 
    "Desk 1", 
    "Desk 2", 
    "Desk 3", 
    "Desk 4", 
    "Accepted - 4", 
    "Under Scrutiny", 
    "Certificate Generated"
]

// F2A UP F1 F2 OT TC
const statusSet2 = [
    "Awaiting Client Confirmation",
    "For Certification",  
    "Completed", 
    "Uploaded"
]

// LT
const statusSet3 = [
    "Awaiting Hearing Date", "Hearing Date Schedule", "Closed for order", "Order received"
]

// LN
const statusSet4 = [
    "Notice Sent", "Period Completed", "Reply Received", "Closed for order", "Order received", "Completed" 
]

// RG
const statusSet5 = [
    "Appointment Done", "Completed" 
]

// F5 F3
const statusSet6 = [
    "Awaiting Client Confirmation",
    "For Certification",  
    "Uploaded",
    "Certified", 
]

const statusSet7 = [
    "MahaRERA Queries",
    "Submitted for Approval",
    "Transfer of Profile",
]

const statusSet8 = [
    "Form 4 Accepted",
    "Form 4 Rejected",
    "Completed", 
    "Uploaded",
]

const statusSet9 = [
    "MahaRERA Queries",
    "Submitted for Approval",
    "Transfer of Profile",
    "Listed - Awaiting Approval",
    "De-Registered",
]

const statusSet10 = [
    "Retrieval Only", 
    "Half Yearly Retainer",
]

const statusSet11 = [
    "Awaiting Documents From Client",
    "Under Scrutiny",
    "Submitted Documents to RERA",
    "Hearing Date Received",
    "MahaRERA Queries",
    "Awaiting Order",
]

const sroAuthorities = [
    "",
    "CREDAI MAHARASHTRA",
    "CREDAI - MCHI",
    "NAREDCO",
    "BAI ",
    "MBVA ",
    "BDA",
    "Public Authority ",
    "Union Territory",
    "Unavailable",
]

const actions = [
    "", 
    "Awaiting Accounts Confirmation", 
    "Accounts Confirmation", 
    "Email Documents", 
    "Client File Prepared", 
    "Client File Given", 
    "Query raised by client", 
    "Query Solved"
]

const caOptions = [
    "",
    "Rutuja Narsingh & Associates", 
    "STP Associates" ,
    "Gupta Lodha & Co",
    "MDA Associates",
    "Others",
]

const teamOptions = [
    "", "Registration 1", "Registration 2"
]

let commonTextFields = [
    {label:"Priority", id:"priority", options:["", "High", "Medium", "Low"]},
    {label:"Deadline", id:"deadline", type:"date"},
    // {label:"Files", id:"files", type:"file", isHidden:true},
]

let commonTextFieldsEnd = [
    {label:"Bill Amount", id:"billAmount", type:"number", isHidden:true},
    {label:"GST", id:"gst", type:"number", isHidden:true},
    {label:"Branch", id:"branch", isRequired:true, options: ['', 'Mumbai', 'Pune']},
    {label:"Remarks", id:"remarks"},
    {label:"Notes", id:"notes"},
    {label:"Payment Rating", id:"rating", type:"number", options: ['',1,2,3,4,4.5,5]},
    {label:"Payment Date", id:"paymentDate", type:"date"},
    {label:"FollowUp Date", id:"followupDate", type:"date"},
    {label:"Confirmation Date", id:"confirmationDate", type:"date"},
    {label:"Correction Type", id:"correctionTaskType", type:"array"},
    {label:"Client Source", id:"clientSource"},
    {label:"Payment Status", id:"paymentStatus"},
    {label:"Files", id:"files", type:"file", isHidden:true},
]

let commonCheckboxFields = [
    {label:"Archived", id:"archived"},
    {label:"Remove From Accounts", id:"removeFromAccounts"},
]

let allStatuses = new Set([...statuses, ...statusSet1, ...statusSet2, ...statusSet3, ...statusSet4, ...statusSet5])

//4. Fields - In services (form 1,2,3,5,2A, Updation , other technical) - In status , add last option as uploaded

const taskFields = {
    "all": {
        texts: [ 
            {label:"Date", id: "createdTime"},
            {label:"Task ID", id: "taskID"},
            {label:"Client ID", id: "clientID"},
            {label:"Client Name", id: "clientName"},
            {label:"Promoter", id: "promoter"},
            {label:"Members Assigned", id: "membersAssigned"},
            {label:"Members Allocated", id: "membersAllocated"},
            {label:"Type", id: "serviceType"},
            {label:"Status", id: "status", options: allStatuses},
        ],
        checkboxes: []
    },
    "Agent Registration": {
        name:"Agent Registration",
        texts:[
            ...commonTextFields,
            {label:"Status", id:"status", options:[...statuses, ...statusSet1]},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"Letterhead", id:"letterHead"},
            {label:"Receipt Format", id:"receiptFormat"},
            {label:"ITR", id:"itr"},
            ...commonCheckboxFields
        ]
    },
    "Project Registration": {
        name:"Project Registration",
        texts:[
            ...commonTextFields,
            {label:"Team", id:"team", options:teamOptions},
            {label:"Status", id:"status", options:[...statuses, ...statusSet1]},
            {label:"Certificate Num", id:"certNum", isRequired: true},
            {label:"Registration Date", id:"registrationDate", type: 'date', isRequired: true},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            {label:"SRO Fees", id:"sroFees", type:"number", isHidden:true},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"Form 3", id:"form3"},
            {label:"Form 2", id:"form2"},
            {label:"Title Certificate", id:"titleCertificate"},
            {label:"Agreement Draft", id:"agreementDraft"},
            {label:"Allotment Letter", id:"allotmentLetter"},
            {label:"SRO", id:"sro"},
            ...commonCheckboxFields
        ]
    },


    "Extension": {
        name:"Extension",
        texts:[
            {label:"Under Section", id:"section", options:["", "Section 6", "Section 7(3)", "Post-Facto"]},
            {label:"Curr Completion Date", id:"currCompletionDate", type:"date"},
            {label:"To Be Extended Date", id:"extenstionDate", type:"date"},
            ...commonTextFields,
            ...consentLetters,
            {label:"Status", id:"status", options:[...statuses, ...statusSet1]},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            {label:"SRO Fees", id:"sroFees", type:"number", isHidden:true},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Correction": {
        name:"Correction",
        texts:[
            {label:"Correction Details", id:"correctionDetails"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet1]},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"Consent Required", id:"consentReq"},
            ...commonCheckboxFields
        ]
    },
    "Form 5 - Audit": {
        name:"Form 5 - Audit",
        texts:[
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Period", id:"period", isRequired:true},
            {label:"CA Assigned", id:"ca", options: caOptions},
            {label:"Status", id:"status", options:[...statuses, ...statusSet6]},
            {label:"Department", id:"department", options:['', 'Package', 'Registration', 'Others - Tech'], isRequired:true},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Form 2A": {
        name:"Form 2A",
        texts:[
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Period", id:"period", isRequired:true},
            {label:"Engineer Assigned", id:"engineer"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Updation": {
        name:"Updation",
        texts:[
            {label:"Work Status", id:"workStatus"},
            {label:"Booked Flats", id:"bookedFlats", type:"number"},
            {label:"Changes to be Made", id:"changesReq"},
            {label:"Documents to be Uploaded", id:"docsReq"},
            {label:"As On Date", id:"asOnDate", type:"date", isRequired:true},
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Form 1": {
        name:"Form 1",
        texts:[
            {label:"Architect Assigned", id:"architect"},
            {label:"As On Date", id:"asOnDate", type:"date", isRequired:true},
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Form 2": {
        name:"Form 2",
        texts:[
            {label:"Engineer Assigned", id:"engineer"},
            {label:"As On Date", id:"asOnDate", type:"date", isRequired:true},
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Form 3": {
        name:"Form 3",
        texts:[
            {label:"CA Assigned", id:"ca", options: caOptions},
            {label:"As On Date", id:"asOnDate", type:"date", isRequired:true},
            {label:"Date of Certification", id:"dateOfCert", type:"date"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet6]},
            {label:"Department", id:"department", options:['', 'Package', 'Registration', 'Others - Tech'], isRequired:true},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Others - Tech": {
        name:"Others - Tech",
        texts:[
            {label:"Service Requested", id:"serviceReq"},
            {label:"Service Description", id:"serviceDesc"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            {label:"Government Fees", id:"govtFees", type:"number"},
            ...commonTextFieldsEnd
            // {label:"Bill Amount", id:"billAmount", type:"number", isHidden:true},
            // {label:"GST", id:"gst", type:"number", isHidden:true},
            // {label:"Files", id:"files", type:"file", isHidden:true},
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },


    "Title Certificate": {
        name:"Title Certificate",
        texts:[
            {label:"Project Type", id:"projectType"},
            {label:"Search (in yrs)", id:"search", type:"number"},
            {label:"Paper Notice", id:"paperNotice"},
            {label:"Title Status", id:"titleStatus"},
            {label:"Prepared By", id:"preparedBy"},
            {label:"Checked By", id:"checkedBy"},
            {label:"Signed By", id:"signedBy"},
            {label:"Date of Certification", id:"dateOfCertification", type:"date"},
            {label:"Manhours", id:"manhours"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet2]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Agreement for Sale Draft": {
        name:"Agreement for Sale Draft",
        texts:[
            {label:"Project Type", id:"projectType"},
            {label:"Prepared By", id:"preparedBy"},
            {label:"Checked By", id:"checkedBy"},
            {label:"Manhours", id:"manhours"},
            {label:"Status", id:"status", options:[...statuses, ...["Completed"]]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Litigation": {
        name:"Litigation",
        texts:[
            {label:"Client Type", id:"clientType", options:["", "Developer", "Agent", "Litigation"]},
            {label:"Username", id:"username"},
            {label:"Password", id:"password"},
            {label:"Respondent Name", id:"respondentName"},
            {label:"Respondent Type", id:"respondentType"},
            {label:"Court", id:"court"},
            {label:"Project Name", id:"projectName"},
            {label:"RERA Number", id:"reraNumber"},
            {label:"Complaint Number", id:"complaint"},
            {label:"Hearing Date", id:"hearingDate"},
            {label:"Package Description", id:"packageDesc"},
            {label:"Manhours", id:"manhours"},
            {label:"Result", id:"result"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet3]},
            ...commonTextFields,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Hourly Package": {
        name:"Hourly Package",
        texts:[
            {label:"Total Hours", id:"totalHours", type:"number"},
            {label:"Utilised Hours", id:"utilisedHours", type:"number"},
            {label:"Task Done", id:"task"},
            {label:"Summary", id:"summary"},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Legal Notice": {
        name:"Legal Notice",
        texts:[
            {label:"Respondent Name", id:"respondentName"},
            {label:"Respondent Type", id:"respondentType"},
            {label:"Project Name", id:"projectName"},
            {label:"RERA Number", id:"reraNumber"},
            {label:"Case Brief", id:"caseBrief"},
            {label:"Dispatch Date", id:"dispatchDate", type:"date"},
            {label:"Manhours", id:"manhours"},
            {label:"Reply Status", id:"replyStatus"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet4]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Registration": {
        name:"Registration",
        texts:[
            {label:"Type of Agreement", id:"typeOfAgreement"},
            {label:"Other Party Name", id:"otherPartyName"},
            {label:"Flat Number", id:"flatNumber"},
            {label:"Wing", id:"wing"},
            {label:"Carpet Area", id:"carpetArea", type:"number"},
            {label:"Consideration Value", id:"considerationValue", type:"number"},
            {label:"Drafting Done By", id:"draftingBy"},
            {label:"Registration Done By", id:"registrationBy"},
            {label:"Date Of Registration", id:"dateOfRegistration", type:"date"},
            {label:"Stamp Duty", id:"stampDuty", type:"number"},
            {label:"Registration", id:"registration"},
            {label:"DHC Charges", id:"dhcCharges", type:"number"},
            {label:"Total", id:"total", type:"number"},
            {label:"Manhours", id:"manhours"},
            {label:"Status", id:"status", options:[...statuses, ...statusSet5]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Removal from Abeyance": {
        name:"Removal from Abeyance",
        texts:[
            {label:"Date of Submission", id:"dateOfSubmission", type:"date"},
            {label: "Abeyance Type", id:"abeyanceType", options:["", "Lapsed Project", "Duplicate Bank Account", "QPR Abeyance"]},
            {label:"Priority", id:"priority", options:["", "High", "Medium", "Low"]},
            {label:"Status", id:"status", options:[]},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"With Consents", id:"withConsents"},
            {label:"Without Consents", id:"withoutConsents"},
            ...commonCheckboxFields
        ]
    },
    "Drafting of Documents": {
        name:"Drafting of Documents",
        texts:[
            {label:"Document Type", id:"documentType"},
            {label:"Prepared By", id:"preparedBy"},
            {label:"Checked By", id:"checkedBy"},
            {label:"Manhours", id:"manhours"},
            {label:"Status", id:"status", options:[...statuses, ...["Completed"]]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Project Closure": {
        name:"Project Closure",
        texts:[
            {label:"OC Date", id:"ocDate", type:'date'},
            {label:"Priority", id:"priority", options:["", "High", "Medium", "Low"]},
            {label:"Status", id:"status", options:[...statuses, ...statusSet8]},
            {label:"Government Fees", id:"govtFees", type:"number", isHidden:true},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"Society Formed", id:"societyFormed"},
            {label:"Conveyance Deed Executed", id:"conveyanceDeedExecuted"},
            {label:"Declaration of Society Formation", id:"declarationOfSocietyFormation"},
            {label:"Declaration of Conveyance Deed", id:"declarationOfConveyanceDeed"},
            ...commonCheckboxFields
        ]
    },
    "Change of Promoter": {
        name:"Change of Promoter",
        texts:[
            {label:"Date of Submission", id:"dateOfSubmission", type:'date'},
            {label:"Status", id:"status", options:[...statuses, ...statusSet7, ...statusSet1]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"With Consents", id:"withConsents"},
            {label:"Without Consents", id:"withoutConsents"},
            ...commonCheckboxFields
        ]
    },
    "De-Registration": {
        name:"De-Registration",
        texts:[
            {label:"Date of Submission", id:"dateOfSubmission", type:'date'},
            {label:"Priority", id:"priority", options:["", "High", "Medium", "Low"]},
            {label:"Status", id:"status", options:[...statuses, ...statusSet9]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            {label:"With Consents", id:"withConsents"},
            {label:"Without Consents", id:"withoutConsents"},
            ...commonCheckboxFields
        ]
    },
    "Order No 40": {
        name:"Order No 40",
        texts:[
            {label:"Priority", id:"priority", options:["", "High", "Medium", "Low"]},
            {label:"Hearing Date", id:"hearingDate", type:'date'},
            {label:"Curr Completion Date", id:"currCompletionDate", type:'date'},
            {label:"To Be Extended Date", id:"extensionDate", type:'date'},
            {label:"Date of Submission", id:"dateOfSubmission", type:'date'},
            {label:"SRO Authority", id:"sroAuthority", options:sroAuthorities},
            {label:"Status", id:"status", options:[...statusSet1, ...statusSet11]},
            ...consentLetters,
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
    "Others - Legal": {
        name:"Others - Legal",
        texts:[
            {label:"Service Required", id:"serviceRequired"},
            {label:"Service Description", id:"serviceDescription"},
            {label:"Prepared By", id:"preparedBy"},
            {label:"Checked By", id:"checkedBy"},
            {label:"Manhours", id:"manhours"},
            {label:"Status", id:"status", options:[...statuses, ...["Completed"]]},
            ...commonTextFieldsEnd,
        ],
        checkboxes:[
            ...commonCheckboxFields
        ]
    },
}

const allTasks = Object.keys(taskFields)

const keyDict = {}

allTasks.forEach(task => {
    if (task == "all")
        return 
    taskFields[task].texts.forEach(field => {
        if (keyDict[field.id]) 
            return
        keyDict[field.id] = true
        taskFields.all.texts.push(field)
    })

    taskFields[task]?.checkboxes?.forEach(field => {
        if (keyDict[field.id]) 
            return
        keyDict[field.id] = true
        taskFields.all.checkboxes?.push(field)
    })
})

let taskPayments = {
    "all":{
        texts:  [
            {label:"Task Date", id: "createdTime"},
            {label:"Task ID", id: "taskID"},
            {label:"Type", id: "serviceType", options:["",...allTasks]},
            {label:"Client ID", id: "clientID"},
            {label:"Client Name", id: "clientName"},
            {label:"Promoter", id: "promoter"},
            {label:"Status", id: "status", options:allStatuses},
            {label:"Remarks", id: "remarks"},
            {label:"Bill Amount", id:"billAmount", type:"number"},
            {label:"GST", id:"gst", type:"number"},
            {label:"SRO Fees", id:"sroFees", type:"number"},
            {label:"Government Fees", id:"govtFees", type:"number"},
            {label:"Received", id:"received", type:"number"},
            {label:"Total", id:"total", type:"number"},
            {label:"Payment Rating", id:"rating"},
            {label:"Balance", id:"balance", type:"number"},
			{label:"Branch", id:"branch"},
            {label:"Archived", id:"archived"},
        // {label:"Files", id:"files", type:"file"},
        ], 
        checkboxes:[]
    }
}

allStatuses = [...allStatuses]

module.exports = {taskFields, allStatuses, allTasks, taskPayments}