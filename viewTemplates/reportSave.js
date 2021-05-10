const reportHtml = require('./reportHtml')
const pdf = require('html-pdf')

const reportSave = (data) => new Promise((resolve, reject) => {
    // console.log(data)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
	currentMonth = months[parseInt(data.month)]
    data.month = currentMonth

    const pdfContent = reportHtml(data)

    const options = { 
        "format": 'A3',
        "border": {
            "left": "0.5cm",
            "right": "0.5cm"
        }
    }
    
    pdf.create(pdfContent, options).toFile(`/tmp/${+new Date}.pdf`, (err, res) => {
        if(err)
            reject(err)
        resolve(res)
    })
})

module.exports = reportSave