const receiptHtml = require('./receiptHtml')
const html_to_pdf = require('html-pdf-node');

const invoiceMail = async (data) => {
    // console.log(data)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    const month = new Date(data.date);
	currentMonth = months[month.getMonth()]
    data.month = currentMonth

    const pdfContent = receiptHtml(data)

    const options = { format: 'A4' };
    const file = { content: pdfContent };

    let pdfBuffer = await html_to_pdf.generatePdf(file, options)

    return [
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
    ]
}

module.exports = invoiceMail