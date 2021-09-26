const modeOptions = [
    "", "Shantanu HDFC", "RERA Easy", "Osha Technologies", "Cash", "Other (please specify)"
]

let paymentFields = {
    all: {
        texts: [
            {label:"Payment Date", id:"date"},
            {label:"Invoice ID", id:"invoiceID"},
            {label:"Received Amount", id:"receivedAmount", type:"number", isRequired:true},
            {label:"Mode", id:"mode", options:modeOptions, isRequired:true},
            {label:"Rating", id:"rating"},
            {label:"Remarks", id:"remarks", isRequired:true},
        ],
        checkboxes: []
    }
}

module.exports = {paymentFields}
