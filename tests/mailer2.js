var pdf = require('html-pdf');

let f2 = `
<table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; height:439px; width:100%">
	<tbody>
		<tr>
			<td style="height:147px; width:58.561%"><span style="font-family:Leelawadee UI,sans-serif"><img alt="" src="https://user-images.githubusercontent.com/44289074/148599687-1426045b-729f-492e-95c3-b2c5cd0d43e4.png" style="height:79px; width:253px" /></span></td>
			<td style="height:147px; width:41.439%">
			<h3><span style="font-family:Leelawadee UI,sans-serif"><strong><u>BILL FROM:</u></strong></span></h3>

			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>Osha Technologies</strong></span></h4>

			<p><span style="font-family:Leelawadee UI,sans-serif">909, The Landmark, Plot No 26A, Sector- 7, Kharghar- 410210 +91 76780 81406</span></p>
			</td>
		</tr>
		<tr>
			<td style="height:128px; width:58.561%">
			<h3><span style="font-family:Leelawadee UI,sans-serif"><u><strong>BILL TO:</strong></u></span></h3>
			<span style="font-family:Leelawadee UI,sans-serif">Maharashtra Developers</span>

			<h3><span style="font-family:Leelawadee UI,sans-serif"><strong><u>PROJECT NAME:</u></strong></span></h3>
			<span style="font-family:Leelawadee UI,sans-serif"> JVMS Corner Stone</span></td>
			<td style="height:128px; width:41.439%">
			<table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; height:108px; width:100%">
				<tbody>
					<tr>
						<td style="height:18px; width:50%"><span style="font-family:Leelawadee UI,sans-serif">Type</span></td>
						<td style="height:18px; width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">Proforma Invoice</span></u></td>
					</tr>
					<tr>
						<td style="height:36px; width:50%"><span style="font-family:Leelawadee UI,sans-serif">Date</span></td>
						<td style="height:36px; width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">14th Dec 2021</span></u></td>
					</tr>
					<tr>
						<td style="height:18px; width:50%"><span style="font-family:Leelawadee UI,sans-serif">PAN No</span></td>
						<td style="height:18px; width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">AAFFO8457Q</span></u></td>
					</tr>
					<tr>
						<td style="height:18px; width:50%"><span style="font-family:Leelawadee UI,sans-serif">Ref No</span></td>
						<td style="height:18px; width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">RERA001959</span></u></td>
					</tr>
					<tr>
						<td style="height:18px; width:50%"><span style="font-family:Leelawadee UI,sans-serif">GSTIN</span></td>
						<td style="height:18px; width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">27AAFFO8457Q1ZB</span></u></td>
					</tr>
				</tbody>
			</table>
			</td>
		</tr>
		<tr>
			<td style="height:110px; width:58.561%"><span style="font-family:Leelawadee UI,sans-serif"><u>Bill Details</u></span>
			<table border="0" cellspacing="0" style="border-collapse:collapse; border-style:hidden; width:100%">
				<tbody>
					<tr>
						<td style="width:50%"><span style="font-family:Leelawadee UI,sans-serif">Bill Period:</span></td>
						<td style="width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">NA</span></u></td>
					</tr>
					<tr>
						<td style="width:50%"><span style="font-family:Leelawadee UI,sans-serif">Quotation No:</span></td>
						<td style="width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">NA</span></u></td>
					</tr>
					<tr>
						<td style="width:50%"><span style="font-family:Leelawadee UI,sans-serif">Quotation Date:</span></td>
						<td style="width:50%"><u><span style="font-family:Leelawadee UI,sans-serif">NA</span></u></td>
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
			<td style="height:18px; width:20%">
			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>SR NO</strong></span></h4>
			</td>
			<td style="height:18px; width:36.2113%">
			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>SERVICE</strong></span></h4>
			</td>
			<td style="height:18px; width:22.1858%">
			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>AMOUNT</strong></span></h4>
			</td>
			<td style="height:18px; width:8.88886%">
			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>GST</strong></span></h4>
			</td>
			<td style="height:18px; width:12.714%">
			<h4><span style="font-family:Leelawadee UI,sans-serif"><strong>TOTAL</strong></span></h4>
			</td>
		</tr>
		<tr>
			<td style="height:18px; width:20%"><span style="font-family:Leelawadee UI,sans-serif">1</span></td>
			<td style="height:18px; width:36.2113%"><span style="font-family:Leelawadee UI,sans-serif">RERA Consultation Fees</span></td>
			<td style="height:18px; width:22.1858%"><span style="font-family:Leelawadee UI,sans-serif">50000</span></td>
			<td style="height:18px; width:8.88886%"><span style="font-family:Leelawadee UI,sans-serif">9000</span></td>
			<td style="height:18px; width:12.714%"><span style="font-family:Leelawadee UI,sans-serif">59000</span></td>
		</tr>
		<tr>
			<td style="background-color:#dddddd; height:18px; width:20%">&nbsp;</td>
			<td style="background-color:#dddddd; height:18px; width:36.2113%"><span style="font-family:Leelawadee UI,sans-serif">1st November 2021 to 30th April 2022</span></td>
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
			<td style="width:56.102%"><u><span style="font-family:Leelawadee UI,sans-serif"><strong>Special Notes</strong></span></u></td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>SUBTOTAL</strong></span></td>
			<td style="width:19.8543%"><u><span style="font-family:Leelawadee UI,sans-serif">50000</span></u></td>
		</tr>
		<tr>
			<td style="width:56.102%"><span style="font-family:Leelawadee UI,sans-serif">NA</span></td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>TAX RATE</strong></span></td>
			<td style="width:19.8543%"><u><span style="font-family:Leelawadee UI,sans-serif">18%</span></u></td>
		</tr>
		<tr>
			<td style="width:56.102%">&nbsp;</td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>TOTAL TAX</strong></span></td>
			<td style="width:19.8543%"><u><span style="font-family:Leelawadee UI,sans-serif">9000</span></u></td>
		</tr>
		<tr>
			<td style="width:56.102%">&nbsp;</td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>TOTAL AMOUNT</strong></span></td>
			<td style="width:19.8543%"><u><span style="font-family:Leelawadee UI,sans-serif">59000</span></u></td>
		</tr>
		<tr>
			<td style="width:56.102%">&nbsp;</td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>PAYMENT MADE</strong></span></td>
			<td style="width:19.8543%"><u><span style="font-family:Leelawadee UI,sans-serif">0</span></u></td>
		</tr>
		<tr>
			<td style="width:56.102%">&nbsp;</td>
			<td style="width:24.0436%"><span style="font-family:Leelawadee UI,sans-serif"><strong>BALANCE PAYABLE</strong></span></td>
			<td style="width:19.8543%"><span style="font-family:Leelawadee UI,sans-serif"><u><strong>59000</strong></u></span></td>
		</tr>
	</tbody>
</table>

<p>&nbsp;</p>

<p>&nbsp;</p>

<table border="0" cellspacing="0" style="border-collapse:collapse; height:108px; width:100%">
	<tbody>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif"><u><strong>PAYMENT INFORMATION</strong></u></span></td>
			<td style="height:18px; width:25.8652%">&nbsp;</td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif">Payment / Cheque to be made in the name of:</span></td>
			<td style="height:18px; width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">OSHA Technologie</span></td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif"><u><strong>For NEFT/RTGS/IMPS:-</strong></u></span></td>
			<td style="height:18px; width:25.8652%">&nbsp;</td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif"><strong>Account Name</strong>:</span></td>
			<td style="height:18px; width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">OSHA TECHNOLOGIES</span></td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif">Account Number:</span></td>
			<td style="height:18px; width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">50200030428962</span></td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif">IFSC Code:</span></td>
			<td style="width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">HDFC0001102</span></td>
			<td style="width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="height:18px; width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif">Name of Bank:</span></td>
			<td style="height:18px; width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">HDFC Bank</span></td>
			<td style="height:18px; width:22.9508%">&nbsp;</td>
		</tr>
		<tr>
			<td style="width:51.0018%"><span style="font-family:Leelawadee UI,sans-serif">Bank Branch:</span></td>
			<td style="width:25.8652%"><span style="font-family:Leelawadee UI,sans-serif">Kharghar</span></td>
			<td style="width:22.9508%">&nbsp;</td>
		</tr>
	</tbody>
</table>

<p>&nbsp;</p>


`

let file = { content: f2};

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

