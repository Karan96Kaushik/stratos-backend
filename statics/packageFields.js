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
            {label:'Yearly Amount', id:"amount", type: 'number', required: true},
            {label:'Start Date', id:"startDate", type: 'date', required: true},
            {label:'Description', id:"description", required: true},
            {label:'Payment Cycle', id:"paymentCycle", options: ['', 'Half Yearly', 'Quarterly'], required: true},
            // {label:'Due Amount', id:"due", type: 'number'},
            // {label:'Received Amount', id:"receivedAmount", type: 'number', required: true},
            {label:'Cersai Undertaking', id:"cersai"},
            {label:'Other Services', id:"other"},
            {label:'Notes', id:"notes"},
            {label:'Remarks', id:"remarks"},
        ],
        checkboxes: [
            {label:'Consultation', id:"Consultation"},
            // {label:'Site Updation', id:"siteUpdation", options: ['N','Y']},
            {label:'Proof Reading', id:"Proof Reading"},
            {label:'Legal Documents', id:"Legal Documents"},
            // {label:'Form 1', id:"form1", options: ['N','Y']},
            // {label:'Form 2', id:"form2", options: ['N','Y']},
            // {label:'Form 2A', id:"form2a", options: ['N','Y']},
            // {label:'Form 3', id:"form3", options: ['N','Y']},
            // {label:'Form 5', id:"form5", options: ['N','Y']},
            // {label:'Format D', id:"formatD", options: ['N','Y']},
            // {label:'Disclosure of Sold', id:"disclosure", options: ['N','Y']},
        ]
    }
}
services.forEach(s => packageFields.all.checkboxes.push({label:s, id: s}))

module.exports = {packageFields}