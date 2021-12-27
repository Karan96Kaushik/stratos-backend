const modeOptions = [
    "", "Shantanu HDFC", "RERA Easy", "Osha Technologies", "Bad Debt", "Other (please specify)"
]

let paymentFields = {
    all: {
        texts: [
            {label:"Payment Date", id:"date"},
            {label:"Invoice ID", id:"invoiceID"},
            {label:"Received Amount", id:"receivedAmount", type:"number", isRequired:true},
            {label:"Mode", id:"mode", options:modeOptions, isRequired:true},
            {label:"Remarks", id:"remarks", isRequired:true},
        ],
        checkboxes: []
    }
}

let clientPaymentFields = {
    texts:[
        {label:"Client Name", id: "name"},
        {label:"Type", id: "clientType"},
        {label:"Total", id: "totalAmount"},
        {label:"Balance", id: "balanceAmount"},
        {label:"Task List", id:"taskList"},
        {label:"Promoter", id:"promoter"},
        {label:"Remarks", id:"remarks"},
    ],
    checkboxes:[]
}

module.exports = {paymentFields, clientPaymentFields}
