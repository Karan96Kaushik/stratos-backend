var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rentikamailer@gmail.com',
        pass: 'karan1996'
    }
});


const mailOptions1 = {
    from: 'rentikamailer@gmail.com', // sender address
    to: 'karankaushik69@gmail.com', // list of receivers
    subject: 'Subject of your email', // Subject line
    html: '<p>Your html here</p>'// plain text body
};

transporter.sendMail(mailOptions1, function (err, info) {
    if (err)
        console.log(err)
    else
        console.log(info);
});
