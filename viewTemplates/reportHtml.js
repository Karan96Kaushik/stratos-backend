const makeRow = (row) => {
    return `
        <tr style="height: 18px;">
        <td style="width: 4.1619%; height: 18px;">${row.unit.name}</td>
        <td style="width: 4.1619%; height: 18px;">${row.tenant.firstName + " " + row.tenant.lastName}</td>
        <td style="width: 8.5243%; height: 18px;">${row.tenant.idName || ""}</td>
        <td style="width: 18.8439%; height: 18px;">${row.totalPayment}</td>
        <td style="width: 7.64448%; height: 18px;">${row.tenant.rent}</td>
        <td style="width: 7.41509%; height: 18px;">&nbsp;</td>
        <td style="width: 9.38305%; height: 18px;">${row.tenant.rent-row.totalPayment}</td>
        </tr>
    `
}

const invoiceHtml = (data) => {
	const today = (new Date)

    const tableRows = data.rows.map(makeRow)

	return `

    <div style="padding: 8px 0; border-width: 20px 0 0; border-top-style: solid; border-image: linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff) 3;">&nbsp;</div>
    <h2><strong>RENT REPORT<br /></strong></h2>
    <table style="width: 100%; border-collapse: collapse; height: 10px;" border="0">
    <tbody>
    <tr style="height: 18px;">
    <td style="width: 33.3333%; height: 10px;">${data.month} 2021</td>
    <td style="width: 33.3333%; height: 10px;">&nbsp;</td>
    <td style="width: 33.3333%; height: 10px;"><strong>Date:</strong> ${today.toISOString().split("T")[0]}</td>
    </tr>
    </tbody>
    </table>
    <p>&nbsp;</p>
    <table style="border-collapse: collapse; width: 100%; height: 54px;" border="1">
    <tbody>
    <tr style="background-color: #bb0000;">
    <td style="width: 4.1619%; height: 18px;"><strong>House<br /></strong></td>
    <td style="width: 4.1619%; height: 18px;"><strong>Tenant<br /></strong></td>
    <td style="width: 8.5243%; height: 18px;"><strong>ID No.</strong></td>
    <td style="width: 18.8439%; height: 18px;"><strong>Amount Paid</strong></td>
    <td style="width: 7.64448%; height: 18px;"><strong>Rent</strong></td>
    <td style="width: 7.41509%; height: 18px;"><strong>Utilities</strong></td>
    <td style="width: 9.38305%; height: 18px;"><strong>Balance</strong></td>
    </tr>
    ${tableRows.join(" ")}
    <tr style="height: 18px;">
    <td style="width: 4.1619%; height: 18px;">&nbsp;</td>
    <td style="width: 4.1619%; height: 18px;">&nbsp;</td>
    <td style="width: 8.5243%; height: 18px;">&nbsp;</td>
    <td style="width: 18.8439%; height: 18px;">&nbsp;</td>
    <td style="width: 7.64448%; height: 18px;">&nbsp;</td>
    <td style="width: 7.41509%; height: 18px;">&nbsp;</td>
    <td style="width: 9.38305%; height: 18px;">&nbsp;</td>
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

module.exports = invoiceHtml;