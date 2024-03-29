const clientFields = {
    all: {
        texts: [
        ],
        checkboxes: []
    },
    Developers: {
        texts:[
            {label:"Date Added", id:"createdTime", isRequired:true},
            {label:"Client ID", id:"clientID", isRequired:true},
            {label:"Name", id:"name", isRequired:true},
            {label:"Promoter", id:"promoter"},
            {label:"Location", id:"location"},
            {label:"Plot No", id:"plotNum"},
            {label:"Plot Area", id:"plotArea"},
            {label:"Total Units", id:"totalUnits", type:"number"},
            {label:"Booked Units", id:"bookedUnits", type:"number"},
            {label:"Work Status", id:"workStatus"},
            {label:"UserID", id:"userID"},
            {label:"Password", id:"password"},
            {label:"RERA Cert No", id:"certNum"},
            {label:"Cert Date", id:"certDate"},
            {label:"Mobile", id:"mobile"},
            {label:"Office", id:"office"},
            {label:"Email", id:"email"},
            {label:"CA", id:"ca"},
            {label:"Engineer", id:"engineer"},
            {label:"Architect", id:"architect"},
            {label:"Reference", id:"reference"},
            {label:"Remarks", id:"remarks"},
            {label:"Completion Date", id:"completionDate"},
            // {label:"Files", id:"files", type:"file"},
        ],
        checkboxes:[
            {label:"Extension", id:"extension"},
        ]
    },
    Agents: {
        texts:[
            {label:"Date Added", id:"createdTime", isRequired:true},
            {label:"Client ID", id:"clientID", isRequired:true},
            {label:"Agent Name", id:"name"},
            {label:"Type", id:"type"},
            {label:"Location", id:"location"},
            {label:"UserID", id:"userID"},
            {label:"Password", id:"password"},
            {label:"Due Date", id:"dueDate"},
            {label:"RERA Cert No", id:"certNum"},
            {label:"Cert Date", id:"certDate"},
            {label:"Mobile", id:"mobile"},
            {label:"Email", id:"email"},
            {label:"Remarks", id:"remarks"},
            {label:"Completion Date", id:"completionDate"},
            {label:"Files", id:"files", type:"file"},
        ],
        checkboxes:[
        ]
    },
    Litigation: {
        texts:[
            {label:"Date Added", id:"createdTime", isRequired:true},
            {label:"Client ID", id:"clientID", isRequired:true},
            {label:"Buyer Name", id:"name"},
            {label:"Type", id:"type"},
            {label:"Location", id:"location"},
            {label:"UserID", id:"userID"},
            {label:"password", id:"password"},
            {label:"Related Project Name", id:"relatedProject"},
            {label:"Related RERA No", id:"reraNum"},
            {label:"Mobile", id:"mobile"},
            {label:"Email", id:"email"},
            {label:"Remarks", id:"remarks"},
            {label:"Hearing Date", id:"completionDate"},
            {label:"Files", id:"files", type:"file"},
        ],
        checkboxes:[
            {label:"Pro Bono", id:"proBono"},
        ]
    }
}

const keyDict = {}

Object.keys(clientFields).forEach(client => {
    if (client == "all")
        return 
    clientFields[client].texts.forEach(field => {
        if (keyDict[field.id]) 
            return
        keyDict[field.id] = true
        clientFields.all.texts.push(field)
    })

    clientFields[client]?.checkboxes?.forEach(field => {
        if (keyDict[field.id]) 
            return
        keyDict[field.id] = true
        clientFields.all.checkboxes?.push(field)
    })
})


module.exports = clientFields