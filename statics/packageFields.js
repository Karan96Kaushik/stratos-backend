const services = [
    // 'Consultation',
    'Site Updation',
    // 'Proof Reading',
    // 'Legal Documents',
    'Form 1',
    'Form 2',
    'Form 2A',
    'Form 3',
    'Form 5',
    'Format D',
    'Disclosure of Sold',
    // 'Other Services', 
]

packageFields = {
    all: {
        texts: [
            {label:'Date', id:"createdTime", type: 'number', required: true},
            {label:'Package ID', id:"packageID", type: 'number', required: true},
            {label:"Client ID", id: "clientID"},
            {label:'Client Name', id:"clientName", required: true},
            {label:'Promoter', id:"promoter", required: true},
            {label:'Start Date', id:"startDate", type: 'date', required: true},
            {label:'End Date', id:"endDate", type: 'date'},
            {label:'Description', id:"description", required: true},
            {label:'Edit Fees Applicable', id:"editFeesApplicable", options: ['', 'Yes', 'No'], isRequired: true},
            {label:'RERA Number', id:"reraNumber"},
            {label:"Client Source", id:"clientSource", isRequired:true},
            {label:'Cersai Undertaking', id:"cersai"},
            {label:'Other Services', id:"other"},
            {label:'Notes', id:"notes"},
            {label:'Remarks', id:"remarks"},
            {label:'Relationship Manager', id:"rmAssigned"},
        ],
        checkboxes: [
            {label:'Consultation', id:"Consultation"},
            {label:'Proof Reading', id:"Proof Reading"},
            {label:'Legal Documents', id:"Legal Documents"},
            {label:'RM Service', id:"Relationship Manager"},
        ]
    },
    accounts: {
        texts: [
            {label:'Date', id:"createdTime", type: 'number', required: true},
            {label:'Package ID', id:"packageID", type: 'number', required: true},
            {label:'Promoter', id:"promoter", required: true},
            {label:'Client Name', id:"clientName", required: true},
            {label:'Start Date', id:"startDate", type: 'date', required: true},
            {label:'End Date', id:"endDate", type: 'date'},
            {label:'Completion Date', id:"completionDate", options: ['', 'Half Yearly', 'Quarterly'], required: true},
            {label:'Description', id:"description", required: true},
            {label:'Edit Fees Applicable', id:"editFeesApplicable", options: ['', 'Yes', 'No'], isRequired: true},
            {label:'Yearly Amount', id:"amount", type: 'number', required: true},
            {label:'Payment Cycle', id:"paymentCycle", options: ['', 'Half Yearly', 'Quarterly'], required: true},
            {label:"Payment Rating", id:"rating", type:"number", options: ['',1,2,3,4,4.5,5]},
            {label:'GST Amount', id:"gstamount", type: 'number'},
            {label:'Due Amount', id:"due", type: 'number'},
            {label:'Received Amount', id:"receivedAmount", type: 'number', required: true},
            {label:'Balance Amount', id:"balanceAmount", type: 'number', required: true},
            {label:'Cersai Undertaking', id:"cersai"},
            {label:'Other Services', id:"other"},
            {label:'Notes', id:"notes"},
            {label:'Remarks', id:"remarks"},
            {label:'Relationship Manager', id:"rmAssigned"},
        ],
        checkboxes: [
        ]
    }
}
services.forEach(s => packageFields.all.checkboxes.push({label:s, id: s}))

module.exports = {packageFields}