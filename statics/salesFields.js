
const quotationFields = {
    "all": {
        texts:[
            {label:"Sales ID", id:"salesID", isRequired:true},
            {label:"Project Name", id:"projectName", isRequired:true},
            {label:"Promoter Name", id:"promoterName", isRequired:true},
            {label:"Certificate No", id:"certificateNo", isRequired:true},
            {label:"Added By", id:"memberName", isRequired:true},
            {label:"Phone 1", id:"phone1", isRequired:true},
            {label:"Phone 2", id:"phone2", isRequired:true},
            {label:"Status", id: "status", },
            {label:"Client ID", id:"exClientID", isRequired:true},
            {label:"Rating", id:"rating", options:[1,2,3,4,5]},
            {label:"Remarks", id:"remarks", isHidden:false},           
            {label:"FollowUp Date", id:"followUpDate", type:"date"},
            {label:"Meeting Date", id:"meetingDate", isRequired:true},
        ],
        checkboxes:[
        ]
    }
}

module.exports = {quotationFields}
