const receiptHtml = require('./receiptHtml')
const pdf = require('html-pdf')

const invoiceMail = (data) => new Promise((resolve, reject) => {
    // console.log(data)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    const month = new Date(data.date);
	currentMonth = months[month.getMonth()]
    data.month = currentMonth

    const pdfContent = receiptHtml(data)

    // const options = { format: 'A4' };
    // const file = { content: pdfContent };

    // let pdfBuffer = await html_to_pdf.generatePdf(file, options)
    const options = { 
        "format": 'A3',
        // "height": '13.5in',
        "border": {
            "left": "0.5cm",
            "right": "0.5cm"
        }
    }
    
    pdf.create(pdfContent, options).toBuffer((err, pdfBuffer) => {

        if(err)
            reject(err)

        resolve ([
            "Rental Receipt", 
            `
                <p><b>Hi ${data.firstName}</b>,<br>
                    This is a Rental Receipt for House number ${data.property} for the month of ${currentMonth}.<br>
                    Amount paid is Ksh.${data.amount}/-
                </p>
                <p>If this email is a mistake, please get in touch with Rentika Support.</p>

                <p>Thanks, <br>
                    Rentika Team
                </p>
            `,
            pdfBuffer,
            "RentReceipt.pdf"
        ])
    })
})

module.exports = invoiceMail