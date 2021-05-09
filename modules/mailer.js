var nodemailer = require('nodemailer');
var templates = require('../viewTemplates')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rentikamailer@gmail.com',
        pass: 'karan1996'
    }
});

const send = (to, type, data) => (new Promise((resolve, reject) => {

    if(!templates[type])
        throw new Error("Invalid mail template")
    
    const [subject, html] = templates[type](data)

    const mailOptions1 = {
        from: 'rentikamailer@gmail.com', // sender address
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions1, function (err, info) {
        if (err) {
            // console.log(err)
           reject(err)
        } else {
            resolve()
        }

        // else
            // console.log(info);
    });
}))

const sendPdf = (to, type, data) => (new Promise((resolve, reject) => {

    if(!templates[type])
        throw new Error("Invalid mail template")
    
    templates[type](data)
        .then(([ subject, html, pdfBuffer, pdfName ]) => {

            const mailOptions1 = {
                from: 'Rentika Team<rentikamailer@gmail.com>', // sender address
                to: to,
                subject: subject,
                html: html,
                attachments: [
                    {
                        filename: pdfName,
                        content: pdfBuffer
                    }
                ]
            };

            transporter.sendMail(mailOptions1, function (err, info) {
                if (err) {
                   reject(err)
                } else {
                    resolve()
                }

            });
            
        })
}))

module.exports = { send, sendPdf }