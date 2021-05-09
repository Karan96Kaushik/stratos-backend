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

let file = { content: `

<div style="padding: 8px 0;
border-width: 20px 0 0;
border-top-style: solid;
     border-image: linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff) 3;">
</div>
<p>
 <br />
 <br /> 
 </p>
<h2><strong>INVOICE</strong></h2>
<table style="width: 100%; border-collapse: collapse;" border="0">
<tbody>
<tr>
<td style="width: 33.3333%;"><strong>Rentika</strong></td>
<td style="width: 33.3333%;">&nbsp;</td>
<td style="width: 33.3333%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 33.3333%;">Street Address, City</td>
<td style="width: 33.3333%;">&nbsp;</td>
<td style="width: 33.3333%;"><strong>Date:</strong> 10 May 2021</td>
</tr>
<tr>
<td style="width: 33.3333%;">Kenya</td>
<td style="width: 33.3333%;">&nbsp;</td>
<td style="width: 33.3333%;"><strong>Invoice No.</strong> INV1212323</td>
</tr>
<tr>
<td style="width: 33.3333%;">rentikamailer@gmail.com</td>
<td style="width: 33.3333%;">&nbsp;</td>
<td style="width: 33.3333%;">&nbsp;</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<table style="width: 100%; border-collapse: collapse;" border="0">
<tbody>
<tr>
<td style="width: 50%;"><strong>Bill To</strong></td>
<td style="width: 50%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 50%;">Tenant Name</td>
<td style="width: 50%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 50%;">House Number 1213</td>
<td style="width: 50%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 50%;">tanant@gmail.com</td>
<td style="width: 50%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 50%;">+2349990090900</td>
<td style="width: 50%;">&nbsp;</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%; height: 72px;" border="1">
<tbody>
<tr style="background-color: #bb0000;">
<td style="width: 50.7517%; height: 18px;"><strong>DESCRIPTION</strong></td>
<td style="width: 9.38305%; height: 18px;"><strong>AMOUNT</strong></td>
</tr>
<tr style="height: 18px;">
<td style="width: 50.7517%; height: 18px;">&nbsp;</td>
<td style="width: 9.38305%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 50.7517%; height: 18px;">&nbsp;</td>
<td style="width: 9.38305%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 50.7517%; height: 18px;">&nbsp;</td>
<td style="width: 9.38305%; height: 18px;">&nbsp;</td>
</tr>
</tbody>
</table>
<!-- #######  YAY, I AM THE SOURCE EDITOR! #########-->
<table style="height: 90px; width: 100%; border-collapse: collapse;" border="0">
<tbody>
<tr style="height: 18px;">
<td style="width: 62.7916%; height: 18px;">&nbsp;</td>
<td style="width: 15.5132%; height: 18px;"><strong>SUBTOTAL</strong></td>
<td style="width: 21.6952%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 62.7916%; height: 18px;">&nbsp;</td>
<td style="width: 15.5132%; height: 18px;"><strong>DISCOUNT</strong></td>
<td style="width: 21.6952%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 62.7916%; height: 18px;">&nbsp;</td>
<td style="width: 15.5132%; height: 18px;"><strong>TAX RATE</strong></td>
<td style="width: 21.6952%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 62.7916%; height: 18px;">&nbsp;</td>
<td style="width: 15.5132%; height: 18px;"><strong>TOTAL TAX</strong></td>
<td style="width: 21.6952%; height: 18px;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="width: 62.7916%; height: 18px;">&nbsp;</td>
<td style="width: 15.5132%; height: 18px;"><strong>TOTAL<br /></strong></td>
<td style="width: 21.6952%; height: 18px;">&nbsp;</td>
</tr>
</tbody>
</table>
<p>
<br /><br /><br /><br /><br />
<br /><br /><br /><br /><br />
<br /><br /><br /><br /><br />
<br /><br /><br /><br /><br />
<br /></p>
<div style="padding: 8px 0;
border-width: 20px 0 0;
border-top-style: solid;
     border-image: linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff) 3;">
</div>
    ` };
// or //
// file = { url: "https://www.npmjs.com/package/html-pdf-node" };

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

