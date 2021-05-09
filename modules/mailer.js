var nodemailer = require('nodemailer');
var templates = require('../viewTemplates')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rentigoamailer@gmail.com',
        pass: 'karan1996'
    }
});

const send = (to, type, data) => (new Promise((resolve, reject) => {

    if(!templates[type])
        throw new Error("Invalid mail template")
    
    const [subject, html] = templates[type](data)

    const mailOptions1 = {
        from: 'kiraamailer@gmail.com', // sender address
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

module.exports = {send}