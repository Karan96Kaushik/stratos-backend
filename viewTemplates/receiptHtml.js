const receiptHtml = (data) => {
	
	return `

    <div style="padding: 8px 0; border-width: 20px 0 0; border-top-style: solid; border-image: linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff) 3;">&nbsp;</div>
    <p><br /><br /></p>
    <h2><strong>RENTAL RECEIPT</strong></h2>
    <table style="width: 100%; border-collapse: collapse; height: 54px;" border="0">
       <tbody>
          <tr style="height: 18px;">
             <td style="width: 33.3333%; height: 18px;">&nbsp;</td>
             <td style="width: 33.3333%; height: 18px;">&nbsp;</td>
             <td style="width: 33.3333%; height: 18px;"><strong>Date:</strong> ${data.date}</td>
          </tr>
          <tr style="height: 18px;">
             <td style="width: 33.3333%; height: 18px;">&nbsp;</td>
             <td style="width: 33.3333%; height: 18px;">&nbsp;</td>
             <td style="width: 33.3333%; height: 18px;"><strong>Invoice No.</strong> INV1212323</td>
          </tr>
       </tbody>
    </table>
    <table style="width: 100%; border-collapse: collapse;" border="0">
       <tbody>
          <tr>
             <td style="width: 43.9307%;"><strong>From:</strong></td>
             <td style="width: 56.0693%;"><strong>To:</strong></td>
          </tr>
          <tr>
             <td style="width: 43.9307%;">${data.firstName + " " + data.lastName}</td>
             <td style="width: 56.0693%;">${data.owner.userName}</td>
          </tr>
          <tr>
             <td style="width: 43.9307%;">House Number: ${data.name}</td>
             <td style="width: 56.0693%;">${data.owner.buildingName}</td>
          </tr>
          <tr>
             <td style="width: 43.9307%;">${data.email}</td>
             <td style="width: 56.0693%;">${data.owner.email}</td>
          </tr>
          <tr>
             <td style="width: 43.9307%;">${data.phone}</td>
             <td style="width: 56.0693%;">${data.owner.phone}</td>
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
             <td style="width: 50.7517%; height: 18px;">Rent - Month of ${data.month}</td>
             <td style="width: 9.38305%; height: 18px;">${data.amount}</td>
          </tr>
          <tr style="height: 18px;">
             <td style="width: 50.7517%; height: 18px;">&nbsp;</td>
             <td style="width: 9.38305%; height: 18px;">&nbsp;</td>
          </tr>
       </tbody>
    </table>
    <table style="height: 90px; width: 100%; border-collapse: collapse;" border="0">
       <tbody>
          <tr style="height: 18px;">
             <td style="width: 62.7916%; height: 18px;">&nbsp;</td>
             <td style="width: 15.5132%; height: 18px;"><strong>SUBTOTAL</strong></td>
             <td style="width: 21.6952%; height: 18px;">${data.amount}</td>
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
             <td style="width: 21.6952%; height: 18px;">${data.amount}</td>
          </tr>
       </tbody>
    </table>
    <p><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <div style="padding: 8px 0; border-width: 20px 0 0; border-top-style: solid; border-image: linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff) 3;">&nbsp;</div>
	`
}

module.exports = receiptHtml;