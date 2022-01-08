var nodemailer = require('nodemailer');
var pdf = require('html-pdf');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rentikamailer@gmail.com',
        pass: 'karan1996'
    }
});

let f1 = `
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
`

let f2 = `
<table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; height:439px; width:100%">
    <tbody>
        <tr>
            <td style="height:147px; width:58.561%"><span style="font-family:Tahoma,Geneva,sans-serif"><img alt="" src="https://user-images.githubusercontent.com/44289074/148599687-1426045b-729f-492e-95c3-b2c5cd0d43e4.png" style="height:79px; width:253px" /></span></td>
            <td style="height:147px; width:41.439%">
            <p><span style="font-family:Tahoma,Geneva,sans-serif"><strong><u>BILL FROM:</u></strong></span></p>

            <p><span style="font-family:Tahoma,Geneva,sans-serif"><strong>Osha Technologies</strong></span></p>

            <p><span style="font-family:Tahoma,Geneva,sans-serif">909, The Landmark, Plot No 26A, Sector- 7, Kharghar- 410210 +91 76780 81406</span></p>
            </td>
        </tr>
        <tr>
            <td style="height:128px; width:58.561%">
            <p><span style="font-family:Tahoma,Geneva,sans-serif"><u><strong>BILL TO:</strong></u></span></p>
            <span style="font-family:Tahoma,Geneva,sans-serif">Maharashtra Developers</span>

            <p><span style="font-family:Tahoma,Geneva,sans-serif"><strong><u>PROJECT NAME:</u></strong></span></p>
            <span style="font-family:Tahoma,Geneva,sans-serif"> JVMS Corner Stone</span></td>
            <td style="height:128px; width:41.439%">
            <table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; height:108px; width:100%">
                <tbody>
                    <tr>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Type</span></td>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Proforma Invoice</span></td>
                    </tr>
                    <tr>
                        <td style="height:36px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Date</span></td>
                        <td style="height:36px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">14th Dec 2021</span></td>
                    </tr>
                    <tr>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">PAN No</span></td>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">AAFFO8457Q</span></td>
                    </tr>
                    <tr>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Ref No</span></td>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">RERA001959</span></td>
                    </tr>
                    <tr>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">GSTIN</span></td>
                        <td style="height:18px; width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">27AAFFO8457Q1ZB</span></td>
                    </tr>
                </tbody>
            </table>
            </td>
        </tr>
        <tr>
            <td style="height:110px; width:58.561%"><span style="font-family:Tahoma,Geneva,sans-serif"><u>Bill Details</u></span>
            <table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; width:100%">
                <tbody>
                    <tr>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Bill Period:</span></td>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">NA</span></td>
                    </tr>
                    <tr>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Quotation No:</span></td>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">NA</span></td>
                    </tr>
                    <tr>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">Quotation Date:</span></td>
                        <td style="width:50%"><span style="font-family:Tahoma,Geneva,sans-serif">NA</span></td>
                    </tr>
                </tbody>
            </table>
            </td>
            <td style="height:110px; width:41.439%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:58.561%">&nbsp;</td>
            <td style="height:18px; width:41.439%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:58.561%">&nbsp;</td>
            <td style="height:18px; width:41.439%">&nbsp;</td>
        </tr>
    </tbody>
</table>

<table border="1" cellspacing="0" style="border-collapse:collapse; height:72px; width:100%">
    <tbody>
        <tr>
            <td style="height:18px; width:20%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>SR NO</strong></span></td>
            <td style="height:18px; width:36.2113%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>SERVICE</strong></span></td>
            <td style="height:18px; width:22.1858%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>AMOUNT</strong></span></td>
            <td style="height:18px; width:8.88886%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>GST</strong></span></td>
            <td style="height:18px; width:12.714%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>TOTAL</strong></span></td>
        </tr>
        <tr>
            <td style="height:18px; width:20%"><span style="font-family:Tahoma,Geneva,sans-serif">1</span></td>
            <td style="height:18px; width:36.2113%"><span style="font-family:Tahoma,Geneva,sans-serif">RERA Consultation Fees</span></td>
            <td style="height:18px; width:22.1858%"><span style="font-family:Tahoma,Geneva,sans-serif">50000</span></td>
            <td style="height:18px; width:8.88886%"><span style="font-family:Tahoma,Geneva,sans-serif">9000</span></td>
            <td style="height:18px; width:12.714%"><span style="font-family:Tahoma,Geneva,sans-serif">59000</span></td>
        </tr>
        <tr>
            <td style="background-color:#dddddd; height:18px; width:20%">&nbsp;</td>
            <td style="background-color:#dddddd; height:18px; width:36.2113%"><span style="font-family:Tahoma,Geneva,sans-serif">1st November 2021 to 30th April 2022</span></td>
            <td style="background-color:#dddddd; height:18px; width:22.1858%">&nbsp;</td>
            <td style="background-color:#dddddd; height:18px; width:8.88886%">&nbsp;</td>
            <td style="background-color:#dddddd; height:18px; width:12.714%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:20%">&nbsp;</td>
            <td style="height:18px; width:36.2113%">&nbsp;</td>
            <td style="height:18px; width:22.1858%">&nbsp;</td>
            <td style="height:18px; width:8.88886%">&nbsp;</td>
            <td style="height:18px; width:12.714%">&nbsp;</td>
        </tr>
    </tbody>
</table>

<p>&nbsp;</p>

<table border="0" cellspacing="0" style="border-collapse:collapse; width:100%">
    <tbody>
        <tr>
            <td style="width:56.102%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>Special Notes</strong></span></td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>SUBTOTAL</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif">50000</span></td>
        </tr>
        <tr>
            <td style="width:56.102%"><span style="font-family:Tahoma,Geneva,sans-serif">NA</span></td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>TAX RATE</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif">18%</span></td>
        </tr>
        <tr>
            <td style="width:56.102%">&nbsp;</td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>TOTAL TAX</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif">9000</span></td>
        </tr>
        <tr>
            <td style="width:56.102%">&nbsp;</td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>TOTAL AMOUNT</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif">59000</span></td>
        </tr>
        <tr>
            <td style="width:56.102%">&nbsp;</td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>PAYMENT MADE</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif">0</span></td>
        </tr>
        <tr>
            <td style="width:56.102%">&nbsp;</td>
            <td style="width:24.0436%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>BALANCE PAYABLE</strong></span></td>
            <td style="width:19.8543%"><span style="font-family:Tahoma,Geneva,sans-serif"><u><strong>59000</strong></u></span></td>
        </tr>
    </tbody>
</table>

<p>&nbsp;</p>

<p>&nbsp;</p>

<table border="0" cellspacing="0" style="border-collapse:collapse; height:108px; width:100%">
    <tbody>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif"><u><strong>PAYMENT INFORMATION</strong></u></span></td>
            <td style="height:18px; width:25.8652%">&nbsp;</td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif">Payment / Cheque to be made in the name of:</span></td>
            <td style="height:18px; width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">OSHA Technologie</span></td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif"><u><strong>For NEFT/RTGS/IMPS:-</strong></u></span></td>
            <td style="height:18px; width:25.8652%">&nbsp;</td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif"><strong>Account Name</strong>:</span></td>
            <td style="height:18px; width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">OSHA TECHNOLOGIES</span></td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif">Account Number:</span></td>
            <td style="height:18px; width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">50200030428962</span></td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif">IFSC Code:</span></td>
            <td style="width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">HDFC0001102</span></td>
            <td style="width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="height:18px; width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif">Name of Bank:</span></td>
            <td style="height:18px; width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">HDFC Bank</span></td>
            <td style="height:18px; width:22.9508%">&nbsp;</td>
        </tr>
        <tr>
            <td style="width:51.0018%"><span style="font-family:Tahoma,Geneva,sans-serif">Bank Branch:</span></td>
            <td style="width:25.8652%"><span style="font-family:Tahoma,Geneva,sans-serif">Kharghar</span></td>
            <td style="width:22.9508%">&nbsp;</td>
        </tr>
    </tbody>
</table>

<p>&nbsp;</p>

`

// let options = { format: 'A4' };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

let file = { content: f2};
// or //
// file = { url: "https://www.npmjs.com/package/html-pdf-node" };

let options = {   
    "height": "10.5in",        // allowed units: mm, cm, in, px
    "width": "8in",   
    "format": "A3"
};


// var fs = require('fs')
// var conversion = require("phantom-html-to-pdf")();
// // if(false)
// conversion({ html: file.content }, function(err, pdf) {
//     var output = fs.createWriteStream('./output.pdf')
//     console.log(pdf.logs);
//     console.log(pdf.numberOfPages);
//     // since pdf.stream is a node.js stream you can use it
//     // to save the pdf to a file (like in this example) or to
//     // respond an http request.
//     pdf.stream.pipe(output);
// });

// if (false)

options = { 
    "format": 'A3',
    // "height": '13.5in',
    "border": {
        // "top": "0in",            // default is 0, units: mm, cm, in, px
        // "bottom": "0in",
        "left": "0.5cm",
        "right": "0.5cm"
    }
}

pdf.create(file.content, options).toBuffer(function(err, pdfBuffer){

    const fs = require('fs');

    fs.writeFile("test.pdf", pdfBuffer, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    // const mailOptions1 = {
    //     from: 'rentikamailer@gmail.com', // sender address
    //     to: 'karankaushik69@gmail.com', // list of receivers
    //     subject: 'Subject of your email', // Subject line
    //     html: '<p>Your html here</p>',// plain text body
    //     attachments: [
    //         {   // utf-8 string as an attachment
    //             filename: 'test.pdf',
    //             content: pdfBuffer
    //         }
    //     ]
    // };
    
    // transporter.sendMail(mailOptions1, function (err, info) {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(info);
    // });
  });

if(false)
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

