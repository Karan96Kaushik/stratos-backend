const invoiceHtml = require('./invoiceHtml')
const pdf = require('html-pdf')

const invoiceMail = (data) => new Promise((resolve, reject) => {
    // console.log(data)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    const month = new Date();
	currentMonth = months[month.getMonth()]
    data.month = currentMonth

    const pdfContent = invoiceHtml(data)

    const options = { 
        "format": 'A3',
        "border": {
            "left": "0.5cm",
            "right": "0.5cm"
        }
    }
    
    pdf.create(pdfContent, options).toBuffer((err, pdfBuffer) => {

        if(err)
            reject(err)

        resolve ([
            "Rent Invoice", 
            `
                <p><b>Hi ${data.firstName}</b>,<br>
                    This is a Rent invoice for House number ${data.property} for the month of ${currentMonth}.<br>
                    Total due is Ksh.${data.rent}/-
                </p>
                <p>If this email is a mistake, please get in touch with Rentika Support.</p>
    
                <p>Thanks, <br>
                    Rentika Team
                </p>
            `,
            pdfBuffer,
            "RentInvoice.pdf"
        ])
    })
})

module.exports = invoiceMail