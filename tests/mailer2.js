var pdf = require('html-pdf');

let f2 = `
<table style="border-collapse: collapse; border-style: hidden; height: 402px; width: 100%;" border="0" cellspacing="0">
<tbody>
<tr style="height: 147px;">
<td style="height: 147px; width: 58.561%;"><span style="font-family: Leelawadee UI,sans-serif;"><img style="height: 79px; width: 253px;" src="https://user-images.githubusercontent.com/44289074/148599687-1426045b-729f-492e-95c3-b2c5cd0d43e4.png" alt="" /></span></td>
<td style="height: 147px; width: 41.439%;">
<p><span style="font-family: Leelawadee UI,sans-serif; padding-bottom: 20px; font-size: 18px; line-height: 1.7;"><strong><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">BILL FROM:</u></strong></span> <br /><span style="font-family: Leelawadee UI,sans-serif; font-size: 16px; line-height: 1.7;"><strong>Osha Technologies</strong></span> <br /><span style="font-family: Leelawadee UI,sans-serif;">909, The Landmark, Plot No 26A, Sector- 7, Kharghar- 410210 <br />+91 76780 81406</span></p>
</td>
</tr>
<tr style="height: 145px;">
<td style="height: 145px; width: 58.561%;">
<p><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474; font-size: 18px; line-height: 1.7;"><strong>BILL TO:</strong></u></span><br /><span style="font-family: Leelawadee UI,sans-serif;">Maharashtra Developers</span><br /><br /><span style="font-family: Leelawadee UI,sans-serif;"><strong><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474; font-size: 18px; line-height: 1.7;">PROJECT NAME:</u></strong></span><br /><span style="font-family: Leelawadee UI,sans-serif;"> JVMS Corner Stone</span></p>
</td>
<td style="height: 145px; width: 41.439%;">
<table style="border-collapse: collapse; border-style: hidden; height: 108px; width: 100%;" border="0" cellspacing="0">
<tbody>
<tr>
<td style="height: 18px; width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Type</span></td>
<td style="height: 18px; width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">Proforma Invoice</span></u></td>
</tr>
<tr>
<td style="height: 18px; width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Date</span></td>
<td style="height: 18px; width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">14th Dec 2021</span></u></td>
</tr>
<tr>
<td style="height: 18px; width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">PAN No</span></td>
<td style="height: 18px; width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">AAFFO8457Q</span></u></td>
</tr>
<tr>
<td style="height: 18px; width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Ref No</span></td>
<td style="height: 18px; width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">RERA001959</span></u></td>
</tr>
<tr>
<td style="height: 18px; width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">GSTIN</span></td>
<td style="height: 18px; width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">27AAFFO8457Q1ZB</span></u></td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr style="height: 74px;">
<td style="height: 74px; width: 58.561%;"><br />
<table style="border-collapse: collapse; border-style: hidden; width: 100.671%; height: 98px;" border="0" cellspacing="0">
<tbody>
<tr>
<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;"><strong><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">Bill Details</u></strong></span></td>
<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">&nbsp;</span></td>
</tr>
<tr>
<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Bill Period:</span></td>
<td style="width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
</tr>
<tr>
<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Quotation No:</span></td>
<td style="width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
</tr>
<tr>
<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Quotation Date:</span></td>
<td style="width: 50%;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
</tr>
</tbody>
</table>
</td>
<td style="height: 74px; width: 41.439%;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="height: 18px; width: 58.561%;">&nbsp;</td>
<td style="height: 18px; width: 41.439%;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="height: 18px; width: 58.561%;">&nbsp;</td>
<td style="height: 18px; width: 41.439%;">&nbsp;</td>
</tr>
</tbody>
</table>
<table style="border-collapse: collapse; height: 64px; width: 100%;" border="1" cellspacing="0">
<tbody>
<tr style="height: 10px;">
<td style="height: 10px; width: 11.474%; text-align: center;">
<h4><span style="font-family: Leelawadee UI,sans-serif;"><strong>SR NO</strong></span></h4>
</td>
<td style="height: 10px; width: 48.2055%; text-align: center;">
<h4><span style="font-family: Leelawadee UI,sans-serif;"><strong>SERVICE</strong></span></h4>
</td>
<td style="height: 10px; width: 18.7176%; text-align: center;">
<h4><span style="font-family: Leelawadee UI,sans-serif;"><strong>AMOUNT</strong></span></h4>
</td>
<td style="height: 10px; width: 8.88886%; text-align: center;">
<h4><span style="font-family: Leelawadee UI,sans-serif;"><strong>GST</strong></span></h4>
</td>
<td style="height: 10px; width: 12.714%; text-align: center;">
<h4><span style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL</strong></span></h4>
</td>
</tr>
<tr style="height: 18px;">
<td style="height: 18px; width: 11.474%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">1</span></td>
<td style="height: 18px; width: 48.2055%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">RERA Consultation Fees</span></td>
<td style="height: 18px; width: 18.7176%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">50000</span></td>
<td style="height: 18px; width: 8.88886%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">9000</span></td>
<td style="height: 18px; width: 12.714%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">59000</span></td>
</tr>
<tr style="height: 18px;">
<td style="background-color: #dddddd; height: 18px; width: 11.474%; text-align: center;">&nbsp;</td>
<td style="background-color: #dddddd; height: 18px; width: 48.2055%; text-align: center;"><span style="font-family: Leelawadee UI,sans-serif;">1st November 2021 to 30th April 2022</span></td>
<td style="background-color: #dddddd; height: 18px; width: 18.7176%; text-align: center;">&nbsp;</td>
<td style="background-color: #dddddd; height: 18px; width: 8.88886%; text-align: center;">&nbsp;</td>
<td style="background-color: #dddddd; height: 18px; width: 12.714%; text-align: center;">&nbsp;</td>
</tr>
<tr style="height: 18px;">
<td style="height: 18px; width: 11.474%; text-align: center;">&nbsp;</td>
<td style="height: 18px; width: 48.2055%; text-align: center;">&nbsp;</td>
<td style="height: 18px; width: 18.7176%; text-align: center;">&nbsp;</td>
<td style="height: 18px; width: 8.88886%; text-align: center;">&nbsp;</td>
<td style="height: 18px; width: 12.714%; text-align: center;">&nbsp;</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%; height: 125px;" border="0" cellspacing="0">
<tbody>
<tr style="height: 19px;">
<td style="width: 56.102%; height: 19px;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>Special Notes</strong></span></u></td>
<td style="width: 24.0436%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>SUBTOTAL</strong></span></td>
<td style="width: 19.8543%; height: 19px;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">50000</span></u></td>
</tr>
<tr style="height: 19px;">
<td style="width: 56.102%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">NA</u></span></td>
<td style="width: 24.0436%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>TAX RATE</strong></span></td>
<td style="width: 19.8543%; height: 19px;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">18%</span></u></td>
</tr>
<tr style="height: 19px;">
<td style="width: 56.102%; height: 19px;">&nbsp;</td>
<td style="width: 24.0436%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL TAX</strong></span></td>
<td style="width: 19.8543%; height: 19px;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span style="font-family: Leelawadee UI,sans-serif;">9000</span></u></td>
</tr>
<tr style="height: 19px;">
<td style="width: 56.102%; height: 19px;">&nbsp;</td>
<td style="width: 24.0436%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL AMOUNT</strong></span></td>
<td style="width: 19.8543%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">59000</u></span></td>
</tr>
<tr style="height: 39px;">
<td style="width: 56.102%; height: 10px;">&nbsp;</td>
<td style="width: 24.0436%; height: 10px; border-bottom: medium solid;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>PAYMENT MADE</strong></span></td>
<td style="width: 19.8543%; height: 10px; border-bottom: medium solid;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">0</u></span></td>
</tr>
<tr style="height: 39px;">
<td style="width: 56.102%; height: 39px;">&nbsp;</td>
<td style="width: 24.0436%; height: 39px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>BALANCE PAYABLE</strong></span></td>
<td style="width: 19.8543%; height: 39px;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>₹59000</strong></u></span></td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; height: 108px; width: 100%;" border="0" cellspacing="0">
<tbody>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>PAYMENT INFORMATION</strong></u></span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Payment / Cheque to be made in the name of: OSHA Technologie<br /></span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;"><u style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>For NEFT/RTGS/IMPS:-</strong></u></span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>Account Name</strong>: OSHA TECHNOLOGIES<br /></span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Account Number: 50200030428962<br /></span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">IFSC Code: HDFC0001102<br /></span></td>
<td style="width: 3.68614%;">&nbsp;</td>
<td style="width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Name of Bank: HDFC Bank</span></td>
<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
</tr>
<tr>
<td style="width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Bank Branch: Kharghar<br /></span></td>
<td style="width: 3.68614%;">&nbsp;</td>
<td style="width: 4.46831%;">&nbsp;</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
`
const fs = require("fs")
f2 = fs.readFileSync("./tests/invoice.html")
// console.log(f2)
let file = { content: f2 + ""};

let options = {   
    "height": "10.5in",        // allowed units: mm, cm, in, px
    "width": "8in",   
    "format": "A3"
};

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

