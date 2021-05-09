var nodemailer = require('nodemailer');
var html_to_pdf = require('html-pdf-node');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rentikamailer@gmail.com',
        pass: 'karan1996'
    }
});

let options = { format: 'A4' };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

let file = { content: "<h1>Welcome to html-pdf-node</h1>" };
// or //
// let file = { url: "https://example.com" };

html_to_pdf.generatePdf(file, options).then(pdfBuffer => {

    const mailOptions1 = {
        from: 'rentikamailer@gmail.com', // sender address
        to: 'karankaushik69@gmail.com', // list of receivers
        subject: 'Subject of your email', // Subject line
        html: '<p>Your html here</p>',// plain text body
        attachments: [
            {   // utf-8 string as an attachment
                filename: 'test.pdf',
                content: pdfBuffer
            }
        ]
    };
    
    transporter.sendMail(mailOptions1, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
    
});

