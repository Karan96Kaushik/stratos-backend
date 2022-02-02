const generateInvoiceHtml = require("../viewTemplates/invoiceTemplate")
const pdf = require('html-pdf');

const generateInvoice = (data) => new Promise((resolve, reject) => {
	
	const html = generateInvoiceHtml(data)

	let file = {content: html}

	let options = {
	    "format": 'A3',
	    "border": {
	        "left": "0.5cm",
	        "right": "0.5cm"
	    }
	}

	pdf.create(file.content, options).toBuffer(function(err, pdfBuffer){
	    const fs = require('fs');
	    let path = "/tmp/invoice" + (+new Date) + ".pdf"
	    fs.writeFile(path, pdfBuffer, function(err) {
	        if(err) {
	            reject(err);
	        }
	        resolve(path)
	    });
	});
})

module.exports = {
	generateInvoice
}