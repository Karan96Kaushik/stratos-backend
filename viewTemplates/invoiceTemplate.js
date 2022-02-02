module.exports = (data) => {

	let html = `<table style="border-collapse: collapse; border-style: hidden; height: 402px; width: 100%;" border="0" cellspacing="0">
		<tbody>
			<tr style="height: 147px;">
				<td style="height: 147px; width: 58.561%;"><span style="font-family: Leelawadee UI,sans-serif;"><img
							style="height: 79px; width: 253px;"
							src="https://user-images.githubusercontent.com/44289074/148599687-1426045b-729f-492e-95c3-b2c5cd0d43e4.png"
							alt="" /></span></td>
				<td style="height: 147px; width: 41.439%;">
					<p><span
							style="font-family: Leelawadee UI,sans-serif; padding-bottom: 20px; font-size: 18px; line-height: 1.7;"><strong><u
									style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">BILL
									FROM:</u></strong></span> <br /><span
							style="font-family: Leelawadee UI,sans-serif; font-size: 16px; line-height: 1.7;"><strong>
								${data.from}</strong></span> <br /><span style="font-family: Leelawadee UI,sans-serif;">909,
							The Landmark, Plot No 26A, Sector- 7, Kharghar- 410210 <br />+91 76780 81406</span></p>
				</td>
			</tr>
			<tr style="height: 145px;">
				<td style="height: 145px; width: 58.561%;">
					<p><span style="font-family: Leelawadee UI,sans-serif;"><u
								style="text-decoration: none; border-bottom: 1px solid; border-color: #747474; font-size: 18px; line-height: 1.7;"><strong>BILL
									TO:</strong></u></span><br /><span
							style="font-family: Leelawadee UI,sans-serif;">${data.billTo}</span><br /><br /><span
							style="font-family: Leelawadee UI,sans-serif;"><strong><u
									style="text-decoration: none; border-bottom: 1px solid; border-color: #747474; font-size: 18px; line-height: 1.7;">PROJECT
									NAME:</u></strong></span><br /><span style="font-family: Leelawadee UI,sans-serif;">
							${data.projectName ?? "-"}</span></p>
				</td>
				<td style="height: 145px; width: 41.439%;">
					<table style="border-collapse: collapse; border-style: hidden; height: 108px; width: 100%;" border="0"
						cellspacing="0">
						<tbody>
							<tr>
								<td style="height: 18px; width: 50%;"><span
										style="font-family: Leelawadee UI,sans-serif;">Type</span></td>
								<td style="height: 18px; width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">${data.type ?? "-"}</span></u></td>
							</tr>
							<tr>
								<td style="height: 18px; width: 50%;"><span
										style="font-family: Leelawadee UI,sans-serif;">Date</span></td>
								<td style="height: 18px; width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">${data.date ?? "-"}</span></u></td>
							</tr>
							<tr>
								<td style="height: 18px; width: 50%;"><span
										style="font-family: Leelawadee UI,sans-serif;">PAN No</span></td>
								<td style="height: 18px; width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">${data.panNum ?? "-"}</span></u></td>
							</tr>
							<tr>
								<td style="height: 18px; width: 50%;"><span
										style="font-family: Leelawadee UI,sans-serif;">Ref No</span></td>
								<td style="height: 18px; width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">${data.invoiceID}</span></u></td>
							</tr>
							<tr>
								<td style="height: 18px; width: 50%;"><span
										style="font-family: Leelawadee UI,sans-serif;">GSTIN</span></td>
								<td style="height: 18px; width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">${data.gstNum ?? "-"}</span></u></td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
			<tr style="height: 74px;">
				<td style="height: 74px; width: 58.561%;"><br />
					<table style="border-collapse: collapse; border-style: hidden; width: 100.671%; height: 98px;"
						border="0" cellspacing="0">
						<tbody>
							<tr>
								<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;"><strong><u
												style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">Bill
												Details</u></strong></span></td>
								<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">&nbsp;</span>
								</td>
							</tr>
							<tr>
								<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Bill
										Period:</span></td>
								<td style="width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
							</tr>
							<tr>
								<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Quotation
										No:</span></td>
								<td style="width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
							</tr>
							<tr>
								<td style="width: 50%;"><span style="font-family: Leelawadee UI,sans-serif;">Quotation
										Date:</span></td>
								<td style="width: 50%;"><u
										style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
											style="font-family: Leelawadee UI,sans-serif;">NA</span></u></td>
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
				<td style="height: 10px; width: 11.474%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>SR NO</strong></span></td>
				<td style="height: 10px; width: 48.2055%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>SERVICE</strong></span></td>
				<td style="height: 10px; width: 18.7176%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>AMOUNT</strong></span></td>
				<td style="height: 10px; width: 9.4669%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>GST</strong></span></td>
				<td style="height: 10px; width: 12.136%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL</strong></span></td>
			</tr>
			<tr style="height: 18px;">
				<td style="height: 18px; width: 11.474%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">1</span></td>
				<td style="height: 18px; width: 48.2055%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">${data.particulars || "-"}</span></td>
				<td style="height: 18px; width: 18.7176%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">${data.billAmount}</span></td>
				<td style="height: 18px; width: 9.4669%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">${data.taxAmount}</span></td>
				<td style="height: 18px; width: 12.136%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">${data.totalAmount}</span></td>
			</tr>
			<tr style="height: 18px;">
				<td style="background-color: #dddddd; height: 18px; width: 11.474%; text-align: center;">&nbsp;</td>
				<td style="background-color: #dddddd; height: 18px; width: 48.2055%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">${" " ?? data.period}</span></td>
				<td style="background-color: #dddddd; height: 18px; width: 18.7176%; text-align: center;">&nbsp;</td>
				<td style="background-color: #dddddd; height: 18px; width: 9.4669%; text-align: center;">&nbsp;</td>
				<td style="background-color: #dddddd; height: 18px; width: 12.136%; text-align: center;">&nbsp;</td>
			</tr>
			<tr style="height: 18px;">
				<td style="height: 18px; width: 11.474%; text-align: center;">&nbsp;</td>
				<td style="height: 18px; width: 48.2055%; text-align: center;">&nbsp;</td>
				<td style="height: 18px; width: 18.7176%; text-align: center;">&nbsp;</td>
				<td style="height: 18px; width: 9.4669%; text-align: center;">&nbsp;</td>
				<td style="height: 18px; width: 12.136%; text-align: center;">&nbsp;</td>
			</tr>
		</tbody>
	</table>
	<table style="border-collapse: collapse; width: 100%; height: 125px;" border="0" cellspacing="0">
		<tbody>
			<tr>
				<td style="width: 63.6165%;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>&nbsp;</strong></span></td>
				<td style="width: 23.8992%;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>&nbsp;</strong></span></td>
				<td style="width: 12.4843%; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;">&nbsp;</span></td>
			</tr>
			<tr style="height: 19px;">
				<td style="width: 63.6165%; height: 19px;"><u
						style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
							style="font-family: Leelawadee UI,sans-serif;"><strong>Special Notes</strong></span></u></td>
				<td style="width: 23.8992%; height: 19px;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>SUBTOTAL</strong></span></td>
				<td style="width: 12.4843%; height: 19px; text-align: center;"><u
						style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
							style="font-family: Leelawadee UI,sans-serif;">${data.billAmount}</span></u></td>
			</tr>
			<tr style="height: 19px;">
				<td style="width: 63.6165%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">NA</u></span>
				</td>
				<td style="width: 23.8992%; height: 19px;"><span style="font-family: Leelawadee UI,sans-serif;"><strong>TAX
							RATE</strong></span></td>
				<td style="width: 12.4843%; height: 19px; text-align: center;"><u
						style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
							style="font-family: Leelawadee UI,sans-serif;">18%</span></u></td>
			</tr>
			<tr style="height: 19px;">
				<td style="width: 63.6165%; height: 19px;">&nbsp;</td>
				<td style="width: 23.8992%; height: 19px;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL TAX</strong></span></td>
				<td style="width: 12.4843%; height: 19px; text-align: center;"><u
						style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><span
							style="font-family: Leelawadee UI,sans-serif;">${data.taxAmount}</span></u></td>
			</tr>
			<tr style="height: 19px;">
				<td style="width: 63.6165%; height: 19px;">&nbsp;</td>
				<td style="width: 23.8992%; height: 19px;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>TOTAL AMOUNT</strong></span></td>
				<td style="width: 12.4843%; height: 19px; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">${data.totalAmount}</u></span>
				</td>
			</tr>
			<tr style="height: 19px;">
				<td style="width: 63.6165%; height: 19px;">&nbsp;</td>
				<td style="width: 23.8992%; height: 19px; border-bottom: medium solid;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>PAYMENT MADE</strong></span></td>
				<td style="width: 12.4843%; height: 19px; border-bottom: medium solid; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;">${data.paidAmount}</u></span>
				</td>
			</tr>
			<tr style="height: 39px;">
				<td style="width: 63.6165%; height: 33px;">&nbsp;</td>
				<td style="width: 23.8992%; height: 33px;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>BALANCE PAYABLE</strong></span></td>
				<td style="width: 12.4843%; height: 33px; text-align: center;"><span
						style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>₹${data.balanceAmount}</strong></u></span>
				</td>
			</tr>
		</tbody>
	</table>
	<p>&nbsp;</p>
	<p>&nbsp;</p>
	<table style="border-collapse: collapse; height: 108px; width: 100%;" border="0" cellspacing="0">
		<tbody>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>PAYMENT
								INFORMATION</strong></u></span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Payment /
						Cheque to be made in the name of: OSHA Technologies<br /></span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;"><u
							style="text-decoration: none; border-bottom: 1px solid; border-color: #747474;"><strong>For
								NEFT/RTGS/IMPS:-</strong></u></span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span
						style="font-family: Leelawadee UI,sans-serif;"><strong>Account Name</strong>: OSHA
						TECHNOLOGIES<br /></span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Account
						Number: 50200030428962<br /></span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">IFSC Code:
						HDFC0001102<br /></span></td>
				<td style="width: 3.68614%;">&nbsp;</td>
				<td style="width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="height: 18px; width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Name of
						Bank: HDFC Bank</span></td>
				<td style="height: 18px; width: 3.68614%;">&nbsp;</td>
				<td style="height: 18px; width: 4.46831%;">&nbsp;</td>
			</tr>
			<tr>
				<td style="width: 91.6633%;"><span style="font-family: Leelawadee UI,sans-serif;">Bank Branch:
						Kharghar<br /></span></td>
				<td style="width: 3.68614%;">&nbsp;</td>
				<td style="width: 4.46831%;">&nbsp;</td>
			</tr>
		</tbody>
	</table>
	<p>&nbsp;</p>
	`

	return html
}