
const salesFields = {
    "all": {
        texts:[
            // {label:"Sales ID", id:"salesID", isRequired:true},
            {label:"Project Name", id:"projectName", isRequired:true},
            {label:"Promoter Name", id:"promoterName", isRequired:true},
            {label:"Members Assigned", id:"membersAssigned", isRequired:true},
            {label:"Added By", id:"memberName", isRequired:true},
            {label:"Phone 1", id:"phone1", isRequired:true},
            {label:"Phone 2", id:"phone2", isRequired:true},
            {label:"Status", id: "status", },
            {label:"Client ID", id:"exClientID", isRequired:true},
            {label:"Village", id:"village"},
            {label:"OC", id:"oc"},
            {label:"District", id:"district"},
            {label:"Completion Date", id:"completionDate"},
            {label:"Form 4", id:"form4"},
            {label:"Certificate No", id:"certificateNo"},
            {label:"Certificate Date", id:"certificateDate"},
            {label:"Rating", id:"rating", options:[1,2,3,4,5]},
            {label:"Remarks", id:"remarks", isHidden:false},           
            {label:"FollowUp Date", id:"followUpDate", type:"date"},
            {label:"Calling Date", id:"callingDate", type:"date", isRequired: true},
            {label:"Meeting Date", id:"meetingDate", type:"date"},
            {label:"Quoted Amount", id:"quotedAmount", type:"number"},
            {label:"Confirmed Amount", id:"confirmedAmount", type:"number"},
        ],
        checkboxes:[
        ]
    }
}

module.exports = salesFields
