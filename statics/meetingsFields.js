
const meetingsFields = {
    "all": {
        texts:[
            {label:"Sales ID", id:"salesID", isRequired:true},
            {label:"Project Name", id:"projectName", isRequired:true},
            {label:"Promoter Name", id:"promoterName", isRequired:true},
            {label:"Member Assigned", id:"membersAssigned", isRequired:true},
            {label:"Status", id: "status", },
            {label:"Client ID", id:"exClientID", isRequired:true},
            {label:"Calling Date", id:"callingDate", type:"date", isRequired: true},
            {label:"Meeting Date", id:"meetingDate", type:"date"},
            {label:"Confirmed Amount", id:"totalAmount", type:"number"},
        ],
        checkboxes:[
        ]
    }
}

module.exports = meetingsFields
